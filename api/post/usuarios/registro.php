<?php
// =================================================================================
// HACER REGISTRO
// =================================================================================
// FICHERO: api/post/usuarios/registro.php
// MÉTODO: POST
// PETICIONES POST ADMITIDAS:
// * api/usuarios/registro -> Dar de alta un nuevo usuario
//      Params: login:login del usuario; pwd:password del usuario; pwd2:password de usuario repetido; email:email del usuario;foto:foto del usuario
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
// COMPROBAR SI EXISTE EL USUARIO EN LA BD
// =================================================================================
function comprobarExistencia($login, $db) {
    $valorRet  = false;
    $mysql     = 'select * from usuario where login=:LOGIN';

    $RESPUESTA = $db->select($mysql, [':LOGIN'=>$login]);
    if($RESPUESTA['CORRECTO']) {
      // Se comprueba si el resultado tiene un único registro y si el password coincide
      if( count($RESPUESTA['RESULT'])==1 && $RESPUESTA['RESULT'][0]['login'] == $login )
        $valorRet = true;
    }
    return $valorRet;
}
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
// =================================================================================
// Fotos auxiliares
// =================================================================================
function subirFoto($FICHEROS, $LOGIN) {
  global $TAM_MAX_ARCHIVO;
  $res = [];

  if($FICHEROS['size'] <= $TAM_MAX_ARCHIVO) {
    $ext = pathinfo($FICHEROS['name'], PATHINFO_EXTENSION); // extensión del fichero
    $NOMBRE_FICHERO = $LOGIN . '.' . $ext;
    $upload_dir     = __DIR__ . '/../../../fotos/usuarios/';
    $uploadfile     = $upload_dir . $NOMBRE_FICHERO; // path fichero destino

    // Se comprueba si la carpeta existe y tiene permisos de escritura
    if (is_dir($upload_dir) && is_writable($upload_dir)) {
      if( !move_uploaded_file($FICHEROS['tmp_name'], $uploadfile) ) {
        $NOMBRE_FICHERO = '';
        $valor_retorno = -2; // Error desconocido al copiar el fichero
      }
      else {
        $valor_retorno = 1; // Fichero copiado correctamente
      }
    }
    else {
        $NOMBRE_FICHERO = '';
        $valor_retorno = -3; // No existe el directorio o no tiene permisos de escritura
    }
  }
  else { // Archivo demasiado grande
    $NOMBRE_FICHERO = '';
    $valor_retorno = 2;
  }

  $res['CODIGO'] = $valor_retorno;
  $res['FICHERO'] = $NOMBRE_FICHERO;

  return $res;
}

// =================================================================================
// Se cogen el usuario y el login:
// =================================================================================
$login = $PARAMS['login'];
$pwd   = $PARAMS['pwd'];
$pwd2  = $PARAMS['pwd2'];
$email = $PARAMS['email'];

if( $pwd != $pwd2 )
{ // Contraseñas distintas
    $RESPONSE_CODE    = 422; // UNPROCESSABLE ENTITY
    $R['RESULTADO']   = 'ERROR';
    $R['CODIGO']      = $RESPONSE_CODE;
    $R['DESCRIPCION'] = 'Contraseñas distintas';
}
else if( $login == '' )
{
    $RESPONSE_CODE    = 422;
    $R['RESULTADO']   = 'ERROR';
    $R['CODIGO']      = $RESPONSE_CODE;
    $R['DESCRIPCION'] = 'Login no válido';
}
else
{
  try{
    // ******** INICIO DE TRANSACCION **********
    $dbCon->beginTransaction();
    if(!comprobarExistencia($login, $db)) { // El usuario no existe, se da de alta
        // ------------------------------------------------------------------
        $mysql  = 'insert into usuario(login,pwd,email) values(:LOGIN,:PWD,:EMAIL)';
        $VPARAMS           = [];
        $VPARAMS[':LOGIN'] = $login;
        $VPARAMS[':PWD']   = $pwd;
        $VPARAMS[':EMAIL'] = $email;
        $resultado = "";
        // ------------------------------------------------------------------
        if( $db->executeStatement($mysql, $VPARAMS) ) {
            // ===============================
            // Si hay foto, hay que guardarla
            // ===============================
            if(isset($_FILES['foto'])) {

                if($_FILES['foto']['error'] != UPLOAD_ERR_NO_FILE) { // Hay ficheros que guardar

                    $resultado = subirFoto( $_FILES['foto'], $login );

                    if( $resultado["CODIGO"] == 1 ) {
                        $mysql = 'update usuario set foto=:FICHERO where login=:LOGIN';
                        $VALORES             = [];
                        $VALORES[':FICHERO'] = $resultado["FICHERO"];
                        $VALORES[':LOGIN']   = $login;

                        // SE EJECUTA LA CONSULTA
                        $db->executeStatement($mysql, $VALORES);
                    }
                }
            }
            // ------------------------------------------------------------------
            $RESPONSE_CODE    = 201; // RESOURCE CREATED INSIDE A COLLECTION
            $R['RESULTADO']   = 'OK';
            $R['CODIGO']      = $RESPONSE_CODE;
            $R['DESCRIPCION'] = 'Usuario creado correctamente';
            $R['LOGIN']       = $login;

            if( $resultado != "" ) { // había foto
                switch( $resultado["CODIGO"] ) {
                    case -2: // Error al intentar guardar la foto en disco
                        $R['ERROR_FOTO'] = 'No se ha podido copiar la foto a la carpeta de fotos.';
                        break;
                    case -3: // La carpeta de fotos no existe o no tiene permisos de escritura
                        $R['ERROR_FOTO'] = 'No se ha podido copiar la foto a la carpeta de fotos. Puede ser que la carpeta de fotos no exista o no tenga permisos de escritura.';
                        break;
                    case 2: // No se guarda la foto porque pesa más de lo permitido
                        $R['ERROR_FOTO'] = 'No se ha podido guardar la foto porque pesa más (' . round($_FILES['foto']['size']/1024) . 'KB) de lo permitido (' . ($TAM_MAX_ARCHIVO/1024) . 'KB)';
                        break;
                }
            }
        }
    } // if(!comprobarExistencia($login))
    else { // El usuario existe
        $RESPONSE_CODE    = 409; // CONFLICT
        $R['RESULTADO']   = 'ERROR';
        $R['CODIGO']      = $RESPONSE_CODE;
        $R['DESCRIPCION'] = 'Login no válido, ya está en uso.';
    }
    // ******** FIN DE TRANSACCION **********
    $dbCon->commit();
  } catch(Exception $e) {
    // Se ha producido un error, se cancela la transacción.
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
