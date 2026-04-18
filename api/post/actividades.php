<?php
// FICHERO: api/post/actividades.php
// PETICIONES POST ADMITIDAS:
// Nota: Todas las operaciones deberán añadir a la petición POST una cabecera "Authorization" con el valor "Bearer {TOKEN}".
// * api/actividades -> Dar de alta un nuevo registro
//   Params: nombre:Nombre de la actividad;
//           descripcion:Texto descriptivo de la actividad;
//           lugar:Lugar asociado a la actividad
//           categorias[]:array de categorias asignadas a la actividad;
//           fotos[]:array de fotos. Cada elemento del array es un input de tipo file
//           descripciones[]:array de descripciones de las fotos.
// * api/actividades/{ID}/comentarios -> Da de alta un comentario para el registro asociado.
//   Params: texto:Texto del comentario;
//           valoracion:Valoración del comentario
// =================================================================================
// INCLUSIÓN DE LA CONEXIÓN A LA BD
// =================================================================================
require_once('../inc/config.php'); // Constantes, etc ...
require_once('../inc/database.php');
// =================================================================================
// Se instancia la base de datos y el objeto producto
// =================================================================================
$db    = new Database();
$dbCon = $db->getConnection();
// =================================================================================
// La instrucción siguiente es para poder recoger tanto errores como warnings que
// se produzcan en las operaciones sobre la BD (funciondes php errorCode() y errorInfo())
// =================================================================================
$dbCon->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING );
// =================================================================================
// =================================================================================
// CONFIGURACION DE SALIDA JSON Y CORS PARA PETICIONES AJAX
// =================================================================================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");
// =================================================================================
// Se toman la parte de la url que viene a partir de publicaciones
// =================================================================================
analizarPeticion( $RECURSO, $PARAMS, 'post' );
// =================================================================================
// =================================================================================
// FUNCIONES AUXILIARES
// =================================================================================
// =================================================================================
/**
 * Copia el archivo indicado al servidor e inserta el correspondiente registro en la BD.
 * @param integer $ID - ID del registro al que pertenece la foto
 * @param $_FILES['fotos'] $FICHEROS - Array de ficheros de la petición POST de php
 * @param texto[] $DESCRIPCIONES - Descripciones de las fotos
 * @param integer $NFOTO - Índice del fichero de foto de $_FILES a subir
 * @return integer - Retorna 0 si todo fue bien. Retorna -1 si hubo algún error al intentar guardar la foto en la BD. Retorna -2 si no se pudo guardar en disco. Retorna 2 si el tamaño del fichero es mayor al permitido.
*/
function subirFoto($ID_REGISTRO, $FICHEROS, $DESCRIPCION, $NFOTO) {
  global $db, $TAM_MAX_ARCHIVO;

  $valor_retorno = -1;

  if($FICHEROS['size'][$NFOTO] <= $TAM_MAX_ARCHIVO) {
    $mysql = 'insert into foto(descripcion,id_actividad,fichero) values(:DESCRIPCION,:ID_REGISTRO,:ARCHIVO);';

    $VALORES                 = [];
    $VALORES[':DESCRIPCION'] = $DESCRIPCION;
    $VALORES[':ID_REGISTRO'] = $ID_REGISTRO;
    $VALORES[':ARCHIVO']     = ''; // nombre por defecto del archivo. Luego se cambia.

    if( $db->executeStatement($mysql, $VALORES) ) {
      $mysql = 'select max(ID) as id_fichero from foto';
      $RESPUESTA = $db->select($mysql);
      if( $RESPUESTA['CORRECTO'] ) {
        $row = $RESPUESTA['RESULT'][0];
        $ID_FICHERO = $row['id_fichero'];

        $ext = pathinfo($FICHEROS['name'][$NFOTO], PATHINFO_EXTENSION); // extensión del fichero
        $NOMBRE_FICHERO = $ID_FICHERO . '.' . $ext;
        $upload_dir     = '../../' . PATH_FOTOS . 'actividades/';
        $uploadfile     = $upload_dir . $NOMBRE_FICHERO; // path fichero destino

        // Se comprueba si la carpeta existe y tiene permisos de escritura
        if (is_dir($upload_dir) && is_writable($upload_dir)) {
          if(move_uploaded_file($FICHEROS['tmp_name'][$NFOTO], $uploadfile)) { // se sube el fichero
            $mysql = 'update foto set fichero=:FICHERO where id=:ID_FICHERO';
            $VALORES                = [];
            $VALORES[':FICHERO']    = $NOMBRE_FICHERO;
            $VALORES[':ID_FICHERO'] = $ID_FICHERO;

            $valor_retorno = 0; // Se guardó bien la foto
          }
          else { // No se ha podido copiar la foto. Hay que eliminar el registro
            $mysql = 'delete from foto where id=:ID_FICHERO';
            $VALORES[':ID_FICHERO'] = $ID_FICHERO;
            $valor_retorno = -2;
          }
          // SE EJECUTA LA CONSULTA
          $db->executeStatement($mysql, $VALORES);
        }
        else {
          $valor_retorno = -3; // No existe el directorio o no tiene permisos de escritura
        }
      }
    }
  }
  else { // Archivo demasiado grande
    $valor_retorno = 2;
  }

  return $valor_retorno;
}
// =================================================================================
// Se pillan las cabeceras de la petición y se comprueba que está la de autorización
// =================================================================================
// En lugar de depender de apache_request_headers() (que puede fallar si migras a Nginx o IIS),
// se utiliza la superglobal $_SERVER. PHP normaliza automáticamente las cabeceras estándar a
// mayúsculas y les añade el prefijo HTTP_.
// Usamos el operador de fusión de null (??) disponible desde PHP 7.0
// Busca HTTP_AUTHORIZATION, si no existe, asigna null.
$AUTORIZACION = $_SERVER['HTTP_AUTHORIZATION'] ?? null;

if (!$AUTORIZACION) { // Acceso no autorizado
  $RESPONSE_CODE    = 403;
  $R['RESULTADO']   = 'ERROR';
  $R['CODIGO']      = $RESPONSE_CODE;
  $R['DESCRIPCION'] = 'Falta autorización';
}
else {
  // =================================================================================
  // Se prepara la respuesta
  // =================================================================================
  $R             = [];  // Almacenará el resultado.
  $RESPONSE_CODE = 200; // código de respuesta por defecto: 200 - OK
  // =================================================================================
  // =================================================================================
  // Se supone que si llega aquí es porque todo ha ido bien y tenemos los datos correctos
  // de la nueva entrada, NO LAS FOTOS. Las fotos se suben por separado una vez se haya
  // confirmado la creación correcta de la entrada.
  // -------------------------------------------------------------
  $TOKEN = str_replace('Bearer ', '', $AUTORIZACION);
  $payload_verif = verificar_jwt_nativo( $TOKEN );
  // -------------------------------------------------------------
  if( $payload_verif == false ) { // El token ha caducado
    $RESPONSE_CODE    = 401;
    $R['RESULTADO']   = 'ERROR';
    $R['CODIGO']      = $RESPONSE_CODE;
    $R['DESCRIPCION'] = 'Sesión caducada.';
  }
  else {
    $login = $payload_verif['login'];
    $ID_REGISTRO = array_shift($RECURSO);
    try{

      $dbCon->beginTransaction();

      if(!is_numeric($ID_REGISTRO)) { // NUEVO REGISTRO
        // Si no es numérico $ID es porque se está creando un nuevo registro
        $nombre      = $PARAMS['nombre'];
        $descripcion = nl2br($PARAMS['descripcion'],false);
        $lugar       = $PARAMS['lugar'];

        // =================================================================================
        // Se inserta el registro principal
        // =================================================================================
        $mysql  = 'insert into actividad(nombre,descripcion,lugar,login) ';
        $mysql .= 'values(:NOMBRE,:DESCRIPCION,:LUGAR,:LOGIN)';
        $VALORES                 = [];
        $VALORES[':NOMBRE']      = $nombre;
        $VALORES[':DESCRIPCION'] = $descripcion;
        $VALORES[':LUGAR']       = $lugar;
        $VALORES[':LOGIN']       = $login;

        if( $db->executeStatement($mysql, $VALORES) ) { // SI SE CREA EL REGISTRO CORRECTAMENTE SE BUSCA SU ID
          $mysql = "select MAX(id) as idActividad from actividad";
          $RESPUESTA = $db->select($mysql);
          if($RESPUESTA['CORRECTO']) {
            $ID_ACTIVIDAD = $RESPUESTA['RESULT'][0]['idActividad'];
            if( isset($PARAMS['categorias']) ) {
              $categorias  = $PARAMS['categorias'];
              $mysql = "select MAX(id) as idActividad from actividad";
              $RESPUESTA = $db->select($mysql);
              if($RESPUESTA['CORRECTO']) {
                $ID_ACTIVIDAD = $RESPUESTA['RESULT'][0]['idActividad'];

                $VALORES                  = [];
                $VALORES[':ID_ACTIVIDAD'] = $ID_ACTIVIDAD;
                // ===============================
                // Se insertan las categorías
                // ===============================
                foreach ($categorias as $cat) {
                  // Primero se busca la categoría. Si existe, no se inserta como nueva
                  $mysql     = "select * from categoria where nombre=:NOMBRE";
                  $RESPUESTA = $db->select($mysql, [':NOMBRE'=>$cat]);
                  if($RESPUESTA['CORRECTO']) {
                    if(count($RESPUESTA['RESULT']) > 0 ) { // Ya existe la categoría
                      $ID_CATEGORIA = $RESPUESTA['RESULT'][0]['id'];
                    }
                    else { // No existe la categoría. Hay que darla de alta
                      $mysql = 'insert into categoria(nombre) values(:NOMBRE)';

                      if( !$db->executeStatement($mysql, [':NOMBRE'=>$cat]) ) {
                        print("ERROR al insertar la categoría: " . $cat . "\n");
                      }
                      else {
                        // Se busca el id de la nueva categoría
                        $mysql     = 'select max(id) as idMax from categoria';
                        $RESPUESTA = $db->select($mysql);

                        if($RESPUESTA['CORRECTO']) {
                          if(count($RESPUESTA['RESULT']) > 0 ){
                            $ID_CATEGORIA = $RESPUESTA['RESULT']['0']['idMax'];
                          }
                        }
                      }
                    }

                    // -----------------------------------------------------------------------
                    // Primero se busca si el registro ya existe. Si ya existe no se inserta. Esto es menos eficiente pero se hace
                    // para evitar que se produzca un error si se envía dos o más ocurrencias de una misma categoría.
                    $mysql = 'select * from actividad_categoria where id_actividad=:ID_ACTIVIDAD and id_categoria=:ID_CATEGORIA';
                    $VALORES                  = [];
                    $VALORES[':ID_ACTIVIDAD'] = $ID_ACTIVIDAD;
                    $VALORES[':ID_CATEGORIA'] = $ID_CATEGORIA;
                    $RESPUESTA = $db->select( $mysql, $VALORES);

                    if( $RESPUESTA['CORRECTO'] ) {

                      if(count($RESPUESTA['RESULT']) < 1 ) { // No existe el registro => hay que insertarlo

                        // Ahora se inserta el registro en la tabla experiencia_categoria
                        $mysql = "insert into actividad_categoria(id_actividad, id_categoria) values(:ID_ACTIVIDAD,:ID_CATEGORIA)";
                        $VALORES                  = [];
                        $VALORES[':ID_ACTIVIDAD'] = $ID_ACTIVIDAD;
                        $VALORES[':ID_CATEGORIA'] = $ID_CATEGORIA;
                        if( !$db->executeStatement($mysql, $VALORES) ) {
                          print("ERROR al insertar la relación actividad_categoria: " . $ID_ACTIVIDAD . "-" . $ID_CATEGORIA . "\n");
                        }
                      }
                      else {
                        // echo "Ya existe la categoría: " . $cat . "\n";
                      }
                    }
                  }
                  // -----------------------------------------------------------------------
                }
              }
              else {
                  print("ERROR");
              }
            } // if( count($categorias) > 0 ) {

            // ===============================
            // Si hay fotos, hay que guardarlas
            // ===============================
            if(isset($_FILES['fotos'])) {
              $textosFotos = $PARAMS['descripciones'];
              if($_FILES['fotos']['error'][0] != UPLOAD_ERR_NO_FILE) { // Hay ficheros que guardar
                for($i=0;$i<count($_FILES['fotos']['name']);$i++) {
                  $val_ret = subirFoto($ID_ACTIVIDAD, $_FILES['fotos'], $textosFotos[$i], $i);
                  $fotoSubida             = [];
                  $fotoSubida['NOMBRE']   = $_FILES['fotos']['name'][$i];
                  $fotoSubida['GUARDADA'] = ($val_ret == 0)?'SI':'NO';

                  if($val_ret !=0) {
                    switch($val_ret) {
                      case -1: // Error al intentar guardar la foto en la BD
                          $fotoSubida['ERROR'] = 'No se ha podido guardar la foto en la BD. Error del servidor o la BD no está creada.';
                        break;
                      case -2: // Error al intentar guardar la foto en disco
                          $fotoSubida['ERROR'] = 'No se ha podido copiar la foto a la carpeta de fotos.';
                        break;
                      case -3: // La carpeta de fotos no existe o no tiene permisos de escritura
                          $fotoSubida['ERROR'] = 'No se ha podido copiar la foto a la carpeta de fotos. Puede ser que la carpeta de fotos no exista o no tenga permisos de escritura.';
                        break;
                      case 2: // No se guarda la foto porque pesa más de lo permitido
                          $fotoSubida['ERROR'] = 'No se ha podido guardar la foto porque pesa más (' . round($_FILES['fotos']['size'][$i]/1024) . 'KB) de lo permitido (' . ($TAM_MAX_ARCHIVO/1024) . 'KB)';
                        break;
                    }
                  }
                  $fotos[] = $fotoSubida;
                }
              }
            }
          }

          // Se prepara la respuesta
          $RESPONSE_CODE     = 201;
          $R['RESULTADO']    = 'OK';
          $R['CODIGO']       = $RESPONSE_CODE;
          $R['DESCRIPCION']  = 'Registro creado correctamente';
          $R['ID_ACTIVIDAD'] = $ID_ACTIVIDAD;
          $R['NOMBRE']       = $nombre;
          if( isset( $fotos ) ) {
            $R['FOTOS'] = $fotos;
          }
        }
        else
        {
          $RESPONSE_CODE    = 500; // INTERNAL SERVER ERROR
          $R['RESULTADO']   = 'ERROR';
          $R['CODIGO']      = $RESPONSE_CODE;
          $R['DESCRIPCION'] = 'Error indefinido al crear el nuevo registro';
        }
      } // if(!is_numeric($ID_REGISTRO)) {
      else { // El registro ya existe y se quiere realizar alguna operación sobre él
        $VALORES            = [];
        $VALORES[':ID_ACTIVIDAD'] = $ID_REGISTRO;
        $VALORES[':LOGIN']  = $login;

        $rec = array_shift($RECURSO);
        switch( $rec ) {
          case 'comentarios': // Dejar comentario para el registro
              $VALORES[':TEXTO']      = nl2br($PARAMS['texto'],false);
              $VALORES[':VALORACION'] = $PARAMS['valoracion'];

              $mysql  = 'insert into comentario(texto, valoracion, login, id_actividad) ';
              $mysql .= 'values(:TEXTO, :VALORACION, :LOGIN, :ID_ACTIVIDAD)';
              $mensaje = 'Guardar comentario.';

              if($db->executeStatement($mysql, $VALORES)) {
                // Ahora hay que actualizar la valoración de la experiencia
                $mysql = 'update actividad a set valoracion=(select ROUND(AVG(valoracion)) from comentario c where c.id_actividad=a.id) where id=:ID_ACTIVIDAD';
                $VALORES                = [];
                $VALORES[':ID_ACTIVIDAD']     = $ID_REGISTRO;
                if($db->executeStatement($mysql, $VALORES)) {
                  $RESPONSE_CODE    = 201;
                  $R['RESULTADO']   = 'OK';
                  $R['CODIGO']      = $RESPONSE_CODE;
                  $R['DESCRIPCION'] = $mensaje . ' Operación realizada correctamente.';
                }
                else {
                  $RESPONSE_CODE    = 500; // INTERNAL SERVER ERROR
                  $R['RESULTADO']   = 'ERROR';
                  $R['CODIGO']      = $RESPONSE_CODE;
                  $R['DESCRIPCION'] = $mensaje . ' Error al actualizar la valoración de la actividad';
                }
              }
              else
              {
                $RESPONSE_CODE    = 500; // INTERNAL SERVER ERROR
                $R['RESULTADO']   = 'ERROR';
                $R['CODIGO']      = $RESPONSE_CODE;
                $R['DESCRIPCION'] = $mensaje . ' Error indefinido al realizar la operación';
              }
            break;
        }
      } // fin del else // El registro ya existe y se quiere realizar alguna operación sobre él

      $dbCon->commit();
    }catch(Exception $e){
      echo $e;
      $dbCon->rollBack();
    }
  } // if( !comprobarSesion($login,$clave) )
}
// =================================================================================
// SE CIERRA LA CONEXION CON LA BD
// =================================================================================
$dbCon = null;
// =================================================================================
// SE DEVUELVE EL RESULTADO DE LA CONSULTA
// =================================================================================
http_response_code($RESPONSE_CODE);
echo json_encode($R);
?>
