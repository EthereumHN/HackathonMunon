import { Inject, Injectable } from '@angular/core';
import { WEB3 } from '../core/web3';
import { BoxOptions, GetProfileOptions, Threebox } from '../core/3box';
import Web3 from 'web3';
import * as ThreeboxFactory from '3box';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThreeBox {

  private Box = new BehaviorSubject<Threebox>(null);
  public box$ = this.Box.asObservable();

  constructor(@Inject(WEB3) private web3: Web3) {}

  /** Get a snapshot of the current box opened */
  public get box(): Threebox {
    return this.Box.getValue();
  }

  /** Set the current box opened and alert components that subscribed to box$ */
  public set box(box: Threebox) {
    this.Box.next(box);
  }

  /**
   * Opens the user space associated with the given address.
   * @param address An ethereum address.
   * @param options Optional parameters.
   * @returns The threeBox instance for the given address.
   */
  public openBox(address?: string, options?: BoxOptions): Promise<Threebox> {
    if (!this.web3.currentProvider) { throw new Error('No web3 provider available'); }
    if (!address && !this.web3.eth.defaultAccount) { throw new Error('Please provide an address'); }
    if (address && !this.web3.utils.isAddress(address)) { throw new Error(`This is not a valid address: ${address}`); }
    return ThreeboxFactory.openBox(
      address || this.web3.eth.defaultAccount,
      this.web3.currentProvider,
      options
    ).then(box => {
      this.box = box;
      return box;
    });
  }

  /**
   * Get the public profile of a given address.
   * @param address An Ethereum address.
   * @param options Optional parameters.
   * @returns A json object with the profile for the given address.
   */
  public getProfile(address: string, options?: GetProfileOptions): Promise<object> {
    if (!this.web3.utils.isAddress(address)) { throw new Error(`This is not a valid address: ${address}`); }
    return ThreeboxFactory.getProfile(address, options);
  }
}
