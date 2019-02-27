/* CONFIGURACIÓN DEL WEBHOOK PARA FACEBOOK MESSENGER 
NOTA: No olvides añadir la ruta: /webhook al URL donde se despliegue*/

'use strict';

// Importa las dependencias necesarias para el servidor.
const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); 


const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// Configura el puerto y envía un mensaje de control
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Crea un endpoint al webhook
app.post('/webhook', (req, res) => {  
 
  let body = req.body;

  // Verifica si es un evento desde la página de suscripción
  if (body.object === 'page') {

    // Itera sobre cada entrada 
    body.entry.forEach(function(entry) {

      // Obtén el mensaje. entry.messaging es un arreglo, pero 
      // pero solo contendrá un mensaje, hay que obtener el índice 0.
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);
    });

    // Retorno un 200, 'OK' a todas las peticiones válidadas.
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Retorna un 404 si el evento no esta en la página de suscripción.
  }

});

// Añade soporte a las peticiones GET del Webhook
app.get('/webhook', (req, res) => {

  // Verificar token debe ser cualquier cadena de carácteres.
  let VERIFY_TOKEN = "<VERIFY_TOKEN>"
    
  // Parse a query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Verifica si el token y el modo está en la cadena de consulta de la petición.
  if (mode && token) {
  
    // Verifica el modo y si el token enviado son correctos.
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      //Responde con el Challenge Token a la petición.
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responde con '403 Forbidden' si los tokens de verificación no coinciden.
      res.sendStatus(403);      
    }
  }
});
