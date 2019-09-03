import { AppMaterialModule } from './app.material.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { rootRouterConfig } from './app.route';
// UI
import { UiModule} from './ui/ui.module';
// Services
import { ThreeBox } from './services/3box.service';
import { ContractService } from './services/contract/contract.service';


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
  providers: [
    ContractService,
    ThreeBox
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
