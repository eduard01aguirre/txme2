import { Injectable, Component } from '@angular/core';
import { URL_SERVICIOS } from '../../config/url.service';
import { LoadingController, ToastController, Platform } from '@ionic/angular';

import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http'; // siempre usar el HTTP DE angular
import { Router } from '@angular/router';
import { async } from 'q';
import { serializePaths } from '@angular/router/src/url_tree';


@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  public user_data: any[];
  // tiene que ser publica para que puedas llamar la variable en otros componentes yep...
  mensaje: any;
  bandera: boolean;

  constructor(private http: HttpClient,
              private loadCtrl: LoadingController,
              private toastCtrl: ToastController,
              private plt: Platform,
              private storage: Storage,
              private router: Router) {
    //this.guarda();
    // ejemplo de función asyncrona
    const sumaAfter2seg = (a , b) => {
      return new Promise (resolve =>
        setTimeout(() =>
        resolve(a + b),
        2000 ));
    };

    const sumaAsync = async() => {
      const cuatro = await sumaAfter2seg(2, 2);
      const six = await sumaAfter2seg(cuatro, 2);
      const ocho = await sumaAfter2seg(six, 2);

      return ocho;
    };

    sumaAsync().then(tot =>
       console.log('Promesa', tot)
       );

  }

  /* SI sirve!*/
  confirmar() {
    if (this.user_data) {
      this.router.navigate(['tabs/home']);
    } else {

      this.confirmar();
    }
  }

  async presentToast(data: any) {
    console.log(data);
    const toast = await this.toastCtrl.create({
      message: data,
      duration: 2000
    });
    toast.present();
  }

  async LOGIN(DATOS:any[]){
      const loading = await this.loadCtrl.create({
        message: 'Cargando...',
      });
      loading.present();
      
    const url = URL_SERVICIOS +'Login' ;

    const loggear = (data:any[]) => {
      return new Promise (resolve => 
      this.http.post(url, {
        matricula: data['matricula'],
        contra: data['contra']
      }).subscribe((resp:any[])=>{
            //console.log(resp);
            if( resp['error']== true ) {
              this.presentToast(resp['Mensaje'])
            }
            this.user_data = resp
            resolve(resp);
        }, error=> {
          console.log(error);
        })
      )
    };

    const  vamonos = () =>{
      if( this.user_data['error'] == false ) {
        this.router.navigate(['tabs/home'])
      }else{
        this.router.navigate(['login'])
      }
    }

    const LOGINasync = async(da:any[]) => {
      const uno = await loggear(da);
      //console.log(uno)
      const dos = await this.set_user()
      console.log('Guardando usuario');
      const tres = await vamonos();
      loading.dismiss();
      return tres
   }

   LOGINasync(DATOS).then(tot =>{
    console.log(this.user_data)
   })
  }
  

  async signIn( user: any = []) {
      console.log('registrando...');
      const loading = await this.loadCtrl.create({
        message: 'Cargando...',
      });
      loading.present();

      const url = URL_SERVICIOS + 'Login/registrar';

      const resp = await this.http.post( url, {
                          matricula : user['matricula'],
                          nombre: user['nombre'],
                          contra: user['contra'],
                        }).subscribe((res) => {

                          console.log(res);
                          this.objetoArreglo(res);

                      if (this.bandera === true) {
                        this.presentToast(this.mensaje);

                      } else {

                        /* aqui va el nuevo LOGIN*/
                      }
                  }, err => {
                    this.presentToast(err.error['Mensaje']);
                  });
                  loading.dismiss();
    }

    set_user = async() => {

      if (this.plt.is('cordova')) {
        // console.log("cel");
        this.storage.ready()
        .then(() => {

          this.storage.set('activo', this.user_data);
        });

      } else {
        console.log('compu');
        // localStorage.setItem( "pedido", JSON.stringify(this.elementos) )
        if (this.user_data['token']) {
          localStorage.setItem('activo', JSON.stringify(this.user_data));
          } else {
            localStorage.removeItem('activo');
          }
      }
    }

    logout() {
      this.user_data['token'] = null;
      this.set_user();
      this.router.navigate(['login']);
    }

    cargar_usuario() {

      const promesa = new Promise((resolve, reject) => {

        if (this.plt.is('cordova')) {
          console.log('storage listo');

          this.storage.ready()
            .then(() => {
              console.log('storage listo');

              this.storage.get('activo')
                .then(activo => {

                  if (activo) {
                    this.user_data = activo;
                  }
                  resolve();
                });
            });
        } else {
          if (localStorage.getItem('activo')) {
            this.user_data = JSON.parse(localStorage.getItem('activo'));
          }
        }
        resolve();
      });
      return promesa;
    }

    guarda(): boolean {
      /*creo quue era para el guard...*/
      if ( this.user_data['token'] != null ) {
        return true;
      } else {
        return false;
      }

    }

    objetoArreglo(data){
       /* var objeto convertido en array, cool*/
       const result = Object.keys(data).map(function(key) {
        return [Number(key), data[key]];
      });
      result.forEach(element => {
        this.bandera = element[1];
          if ( this.bandera === true) {
            this.mensaje = element[1];
          }
      });
    }

  /**  Encuesta  **/
    async verifica(){
      const loading = await this.loadCtrl.create({
        message: 'Cargando...',
      });
      loading.present();

      const url = URL_SERVICIOS + 'Encuesta';

      const ans = await this.http.post(url,{
        matricula: this.user_data['matricula']
      }).subscribe((data)=>{
        console.log(data)

        this.objetoArreglo(data)
        console.log(this.bandera);
        this.banderilla();
        if( this.bandera === true ){
          console.log(this.mensaje)
          this.presentToast(this.mensaje);
        
        }else{
          this.presentToast(this.mensaje);
        }
      },error =>{
        console.log(error);
      });
      loading.dismiss();
    }

    async banderilla(){
      const loading = await this.loadCtrl.create({
        message: 'Verificando...',
      });
      loading.present();

      if( this.bandera === null ){
        this.banderilla()
      }else if( this.bandera === false){
        this.router.navigate(['encuesta'])
      }else{
        return;
      }
      loading.dismiss();
    }
}
