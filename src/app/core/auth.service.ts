import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable()
export class AuthService {

  authState: any = null;
  userRef: AngularFireObject<any>;
  userSelect: AngularFireObject<any>;
  cuser;
  user: any;
  userEmail: any;
  userId;
  constructor(private afAuth: AngularFireAuth,
              private db: AngularFireDatabase,
              private router: Router) {
    this.afAuth.authState.subscribe((auth) => {
      this.authState = auth;
    });
  }

  // Regresa un tru si se logeo
  get authenticated(): boolean {
    return this.authState !== null;
  }

  // Regresa info del loggeado
  get currentUser(): any {
    return this.authenticated ? this.authState : null;
  }

  // Regreso
  get currentUserObservable(): any {
    return this.afAuth.authState;
  }

  // Regresa el UID
  get currentUserId(): string {
    return this.authenticated ? this.authState.uid : '';
  }



  // Regresa el nombre de el user
  get currentUserDisplayName(): string {
    if (!this.authState) {
      return 'Guest';
    } else {
      return this.authState.displayName || 'No ingreso Nombre';
    }
  }

  //// Iniciar con redes sociales ////


  googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    return this.socialSignIn(provider);
  }

  facebookLogin() {
    const provider = new firebase.auth.FacebookAuthProvider();
    return this.socialSignIn(provider);
  }



  private socialSignIn(provider) {
    return this.afAuth.auth.signInWithPopup(provider)
      .then((credential) => {
        this.authState = credential.user;
        if (credential.additionalUserInfo.isNewUser === true) {
        this.setUserData();
      } else {
      }
     })
      .catch(error => console.log(error));
  }



  signOut(): void {
    this.afAuth.auth.signOut();
    this.router.navigate(['/login']);
  }


  //// Helpers ////

  public updateUserData(user: any) {

    const path = `users/${this.currentUserId}`; // Endpoint on firebase
    const userRef: AngularFireObject<any> = this.db.object(path);

    const data = {
      correo: this.authState.email,
      foto: this.authState.photoURL,
      nombre: this.authState.displayName,
      talleres: '' || user.talleres ,
      gustados: '' || user.gustados,
      busquedatesoro: '' || user.busquedatesoro,
      tipotelefono: '' || user.tipotelefono,
      motivo: '' || user.motivo,
      provider: this.authState.providerId ,
      genero: '' || user.genero,
      numerotelefono: '' || user.numerotelefono,
      fechaNacimiento: '' || user.fechaNacimiento,
      encuesta: true || user.encuesta,
      dateCreated: new Date().toString() || user.dateCreated,
      dateUpdate: new Date().toString(),
    };

    userRef.update(data).catch(error => console.log(error));
  }

  public setUserData(): void {

    const path = `users/${this.currentUserId}`; // Endpoint on firebase
    const userRef: AngularFireObject<any> = this.db.object(path);

    const data = {
      correo: this.authState.email,
      foto: this.authState.photoURL,
      nombre: this.authState.displayName,
      talleres: '' ,
      gustados: '',
      busquedatesoro: '',
      tipotelefono: '',
      motivo: '',
      genero: '',
      numerotelefono: '',
      encuesta: false,
      dateCreated: new Date().toString(),
    };

    userRef.set(data)
      .catch(error => console.log(error));

  }

  getCurrentUser() {
    return new Promise<any>((resolve, reject) => {
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          resolve(user);
        } else {
          reject('No user logged in');
        }
      });
    });
  }

  get currentUserData(): Observable<any> {
    return this.db.object(`users/${this.currentUserId}`).snapshotChanges().pipe(map(user => {
      return Object.assign(user.payload.val(), { $key: user.key });
    }));
  }

  getUserDetails(id: string): Observable<any> {
    this.userSelect = this.db.object(`users/${id}`);
    this.cuser = this.userSelect.valueChanges();
    return this.cuser;
  }


  updateEstadoTaller(key: string, value: any, id?: any): void {
    if (id) {
      const ref = this.db.object(`users/${key}/talleres/${id}/`);
      console.log(value);
      ref.update(value);
    } else {
      this.userRef.update(value);
    }
  }



  updateCurrentUser(value) {
    return new Promise<any>((resolve, reject) => {
      this.user.updateProfile({
        displayName: value.name,
        photoURL: this.user.photoURL
      }).then(res => {
        resolve(res);
      }, err => reject(err));
    });
  }

  validateAdmin(uid: string) {
    return this.db.object(`admins/${uid}`).valueChanges();
  }
}
