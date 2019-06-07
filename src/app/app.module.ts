import { AppMaterialModule } from './app.material.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { ContractService } from './services/contract/contract.service';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { rootRouterConfig } from './app.route';
// UI
import { UiModule} from './ui/ui.module';
// IPFS
import { initIPFS, IPFS } from './services/ipfs';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    AppMaterialModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(rootRouterConfig, { useHash: false }),
    UiModule
  ],
  providers: [{
      provide: APP_INITIALIZER,
      useFactory: initIPFS,
      multi: true,
      deps: [IPFS]
    },
    ContractService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
