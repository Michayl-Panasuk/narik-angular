import { isPresent, isString, toFilterFunction } from "narik-common";
import {
  NarikDataSource,
  FilterItems,
  NarikViewField,
  IPagingInfo
} from "narik-infrastructure";
import { NarikDataTable } from "narik-ui-core";
import { Subject } from "rxjs/internal/Subject";

import { SelectionModel } from "@angular/cdk/collections";
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  Output,
  EventEmitter,
  AfterContentInit,
  ChangeDetectorRef,
  AfterViewChecked,
  Injector
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";

import { MatLazyDataSource } from "../data-source/mat-lazy-data-source";
import { MatLocalDataSource } from "../data-source/mat-local-data-source";
import { takeWhile } from "rxjs/operators";

@Component({
  selector: "narik-mat-data-table , narik-data-table",
  templateUrl: "narik-mat-data-table.component.html"
})
export class NarikMatDataTable extends NarikDataTable
  implements OnInit, AfterViewInit, AfterContentInit, AfterViewChecked {
  fieldNames: string[] = [];
  filterObj: any = {};
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild("searchInput") searchInput: ElementRef;
  filterChange = new Subject<FilterItems>();

  selection: SelectionModel<any>;
  _dataSource: NarikDataSource<any>;
  _fields: NarikViewField[];
  _selectMode: "None" | "One" | "Multiple" = "Multiple";
  _showRowNumber = true;
  _pagingInfo: IPagingInfo;
  _selectedItem: any;
  _containerCssClass = "mat-table-container";
  _rowCssClass: string;
  _selectedItems: any[];

  @Output()
  selectedItemsChange = new EventEmitter<any[]>();

  @Output()
  rowDoubleClick = new EventEmitter<any>();

  @Input()
  set rowCssClass(value: string) {
    this._rowCssClass = value;
  }
  get rowCssClass(): string {
    return this._rowCssClass;
  }

  @Input()
  set containerCssClass(value: string) {
    this._containerCssClass = value;
  }
  get containerCssClass(): string {
    return this._containerCssClass;
  }

  @Input()
  set selectedItems(value: any[]) {
    this._selectedItems = value;
    this.selectedItemsChange.emit(value);
  }
  get selectedItems(): any[] {
    return this._selectedItems;
  }

  @Output()
  selectedItemChange = new EventEmitter<any>();

  @Input()
  set selectedItem(value: any) {
    if (this._selectedItem !== value) {
      this._selectedItem = value;
      this.selectedItemChange.emit(value);
    }
  }
  get selectedItem(): any {
    return this._selectedItem;
  }

  @Input()
  set pagingInfo(value: IPagingInfo) {
    this._pagingInfo = value;
  }
  get pagingInfo(): IPagingInfo {
    return this._pagingInfo;
  }

  @Input()
  set showRowNumber(value: boolean) {
    this._showRowNumber = value;
  }
  get showRowNumber(): boolean {
    return this._showRowNumber;
  }

  @Input()
  set selectMode(value: "None" | "One" | "Multiple") {
    this._selectMode = value;
  }
  get selectMode(): "None" | "One" | "Multiple" {
    return this._selectMode;
  }

  @Input()
  set fields(value: NarikViewField[]) {
    this._fields = value;
  }
  get fields(): NarikViewField[] {
    return this._fields;
  }

  get isServerSide(): boolean {
    return this.dataSource && this.dataSource instanceof MatLazyDataSource;
  }

  @Input()
  set dataSource(value: NarikDataSource<any>) {
    this._dataSource = value;
  }
  get dataSource(): NarikDataSource<any> {
    return this._dataSource;
  }

  get currentData(): any[] {
    return this.dataSource.currentData;
  }

  constructor(injector: Injector, private changeDetector: ChangeDetectorRef) {
    super(injector);
  }

  ngOnInit() {
    this.makeColumns();
    this.selection = new SelectionModel<any>(
      this.selectMode === "Multiple",
      []
    );
    this.selection.changed.subscribe(x => {
      this.selectedItems = this.selection.selected;
    });
  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.initDataSource(this.dataSource);
    }
  }
  ngAfterContentInit() {}
  ngAfterViewChecked() {
    this.changeDetector.detectChanges();
  }

  public select(row: any) {
    this.selectedItem = row;
  }
  dblclick(row) {
    this.rowDoubleClick.emit(row);
  }
  initDataSource(ds: NarikDataSource<any>) {
    if (ds instanceof MatLocalDataSource) {
      this.initLocalDataSource(this.dataSource as MatLocalDataSource<any>);
    } else {
      this.initRemoteDataSource(this.dataSource as MatLazyDataSource<any>);
    }
    this.dataSource.dataObservable
      .pipe(takeWhile(x => this.isAlive))
      .subscribe(x => {
        this.selection.clear();
      });
    this.dataSource.loadData();
  }
  initLocalDataSource(ds: MatLocalDataSource<any>) {
    ds.sort = this.sort;
    ds.paginator = this.paginator;
  }

  initRemoteDataSource(ds: MatLazyDataSource<any>) {
    ds.filterSubject = this.filterChange;
    ds.sort = this.sort;
    ds.paginator = this.paginator;
  }

  makeColumns() {
    this.fieldNames = this.fields ? this.fields.map(x => x.model) : [];
    if (this.selectMode !== "None") {
      this.fieldNames.unshift("select");
    }
    if (this.showRowNumber) {
      this.fieldNames.unshift("index");
    }
    if (this.rowCommands && this.rowCommands.length !== 0) {
      this.fieldNames.push("actions");
    }

    this.fields.forEach(x => {
      this.filterObj["$$" + x.model] = x.type;
    });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.currentData.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.currentData.forEach(row => this.selection.select(row));
  }

  applyFilter(filterValue, column?: NarikViewField) {
    const filter = this.createFilter(filterValue, column);

    if (this.isServerSide) {
      this.filterChange.next(filter);
    } else {
      if (filter) {
        const filterFunction = toFilterFunction(filter);
        (this.dataSource as MatLocalDataSource<any>).filter = <any>(
          filterFunction
        );
      } else {
        (this.dataSource as MatLocalDataSource<any>).filter = null;
      }
    }
  }

  createFilter(filterValue, column: NarikViewField): FilterItems {
    this.filterObj[column ? column.model : "$$overallFilter"] = isString(
      filterValue
    )
      ? filterValue.trim()
      : filterValue;

    const filter0: FilterItems = {
      condition: "or",
      filters: []
    };
    if (this.filterObj["$$overallFilter"]) {
      this.fields.forEach(x => {
        if (!x.type || x.type === "text") {
          filter0.filters.push({
            field: x.model,
            operator: "contains",
            value: this.filterObj["$$overallFilter"]
          });
        }
      });
    }

    const filter1: FilterItems = {
      condition: "and",
      filters: []
    };
    for (const filterKey in this.filterObj) {
      if (!filterKey.startsWith("$$")) {
        if (
          this.filterObj.hasOwnProperty(filterKey) &&
          isPresent(this.filterObj[filterKey]) &&
          this.filterObj[filterKey] !== ""
        ) {
          filter1.filters.push({
            field: filterKey,
            operator:
              !this.filterObj["$$" + filterKey] ||
              this.filterObj["$$" + filterKey] === "text"
                ? "contains"
                : "eq",
            value: this.filterObj[filterKey]
          });
        }
      }
    }
    if (filter0.filters.length !== 0 && filter1.filters.length === 0) {
      return filter0;
    } else if (filter1.filters.length !== 0 && filter0.filters.length === 0) {
      return filter1;
    } else if (filter1.filters.length !== 0 && filter0.filters.length !== 0) {
      return {
        condition: "and",
        filters: [filter0, filter1]
      };
    } else {
      return null;
    }
  }

  rowCommandClicked(commandKey, row) {
    this.rowCommandClick.emit({
      key: commandKey,
      item: row
    });
  }
}