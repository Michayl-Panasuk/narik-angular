import { OnInit, OnDestroy } from "@angular/core";



/**
 * Narik component
 * Base class for all components
 */
export abstract class NarikComponent implements OnInit, OnDestroy {
  /**
   * Determines whether component is  alive or not
   */
  isAlive = true;

  /**
   * on init
   */
  ngOnInit(): void {}

  /**
   * on destroy
   */
  ngOnDestroy(): void {
    this.isAlive = false;
  }
}
