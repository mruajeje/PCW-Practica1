<?php
// =================================================================================
// HACER LOGIN
// =================================================================================
// FICHERO: api/post/usuarios/login.php
// MÉTODO: POST
// * api/usuarios/login -> Hacer login de un nuevo usuario
//      Params: login:login del usuario; pwd:password del usuario; recordar:recordar el login durante un mes en el servidor (true/false)
// =================================================================================
// INCLUSION DE LA CONEXION A LA BD
// =================================================================================
require_once('../../inc/config.php'); // Constantes, etc ...
require_once('../../inc/database.php');
// =================================================================================
// Se instancia la base de datos y el objeto producto
// =================================================================================
$db    = new Database();
$dbCon = $db->getConnection();
// =================================================================================
// CONFIGURACION DE SALIDA JSON Y CORS PARA PETICIONES AJAX
// =================================================================================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");
// =================================================================================
// Se prepara la respuesta
// =================================================================================
$R = [];  // Almacenará el resultado.
// =================================================================================
// Se cogen los parámetros de la petición
// =================================================================================
$PARAMS = $_POST;
// Se pillan los parámetros de la petición:
$LOGIN    = $PARAMS['login'] ?? null;
$PWD      = $PARAMS['pwd'] ?? null;
$RECORDAR = $PARAMS['recordar'] ?? null;

// =================================================================================
if( !($LOGIN && $PWD) ) {
  $RESPONSE_CODE    = 400;
  $R['RESULTADO']   = 'ERROR';
  $R['CODIGO']      = $RESPONSE_CODE;
  $R['DESCRIPCION'] = 'Parámetros incorrectos';
}
else {
  try {
    // ******** INICIO DE TRANSACCION **********
    $dbCon->beginTransaction();
    $mysql = "select * from usuario where login=:LOGIN";
    $RESPUESTA = $db->select($mysql, [':LOGIN'=>$LOGIN]);
    if($RESPUESTA['CORRECTO']) {
        if( count($RESPUESTA['RESULT'])==1 && $RESPUESTA['RESULT'][0]['pwd'] == $PWD ) { // Se comprueba si el resultado tiene un único registro y si el password coincide
            $USUARIO = $RESPUESTA['RESULT'][0];
            // ------------------------------------------------------------
            // Generación del JSON Web Token (JWT)
            $payload = [
                "login" => $USUARIO['login'],
                "email" => $USUARIO['email'],
                "exp" => time() + ($RECORDAR?(3600 * 24 * 30):$TIEMPO_SESION), // Si hay que recordar el login se le suma los segundos de 30 días, si no hay que recordar se le suman los segundos de la duración de sesión por defecto (archivo inc/config.php)
            ];
            $jwt = generar_jwt_nativo( $payload );
            // ------------------------------------------------------------
            $mysql  = 'update usuario set token="' . $jwt . '"';
            $mysql .= ', ultimo_acceso="' . date('Y-m-d H:i:s') . '"';
            $mysql .= ' where login=:LOGIN';

            if($db->executeStatement($mysql, [':LOGIN'=>$LOGIN])) {
                $RESPONSE_CODE   = 200;
                $R['RESULTADO']  = 'OK';
                $R['CODIGO']     = $RESPONSE_CODE;
                $R['TOKEN']      = $jwt;
                $R['LOGIN']      = $LOGIN;
                $R['FIN_SESION'] = date("Y-m-d H:i:s", $payload['exp']);
            }
            else {
                $RESPONSE_CODE = 500;
            }
        }
        else {
          $RESPONSE_CODE = 401;
        }
    }
    else {
        $RESPONSE_CODE    = 500;
        $R['RESULTADO']   = 'ERROR' ;
        $R['DESCRIPCION'] = 'Se ha producido un error en el servidor al ejecutar la consulta.';
        $R['ERROR']       = $RESULTADO['ERROR'];
    }

    switch($RESPONSE_CODE) {
      case 401:
          $R['RESULTADO']   = 'ERROR';
          $R['CODIGO']      = $RESPONSE_CODE;
          $R['DESCRIPCION'] = 'Login/password no correcto';
        break;
      case 500:
          $R['RESULTADO']   = 'ERROR';
          $R['CODIGO']      = $RESPONSE_CODE;
          $R['DESCRIPCION'] = 'Se ha producido un error en el servidor.';
        break;
    }
    // ******** FIN DE TRANSACCION **********
    $dbCon->commit();
  } catch(Exception $e) {
    // Se ha producido un error, se cancela la transacción.
    echo $e->getMessage();
    $dbCon->rollBack();
  }
}
// =================================================================================
// SE CIERRA LA CONEXION CON LA BD
// =================================================================================
$dbCon = null;
// =================================================================================
// SE DEVUELVE EL RESULTADO DE LA CONSULTA
// =================================================================================
http_response_code($RESPONSE_CODE);
print json_encode($R);
?>
