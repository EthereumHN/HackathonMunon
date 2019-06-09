import { Component, Inject, OnInit } from '@angular/core';
import { IPFS } from './services/ipfs';
import { Buffer } from 'buffer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent implements OnInit {
  public hash: string;

  constructor(
  //  @Inject(IPFS) private ipfs
    ) {}

  async ngOnInit() {
 //   const version = await this.ipfs.version();
//    console.log({version});
  }

//  public async set(path: string, value: string) {
//    const content = Buffer.from(value);
//    const filesAdded = await this.ipfs.files.add({path, content});
//    this.hash = filesAdded[0].hash;
//  }

//  public async get(hash: string) {
//    const fileBuffer = await this.ipfs.files.cat(hash);
//    console.log(fileBuffer.toString());
//  }
}
