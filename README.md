# cotizame
An application made for micro companies who wants to save time and money.

## Features
- Manage your prices easy and fast.
- Manage your clients, do not lose them anymore.
- Automatize your quotes with profesionality.
- Automatize reminders so your clients can benefit from your product/service.
- Respond with PDF quotes and many other formats.
  


---


## Notas. NAVEGANDO EN EL CODIGO
*src\interface\http\router.ts*
- La unica ruta que no esta protegida por un auth middleware es AUTH. Lo cual tiene sentido porque es el punto de entrada.
- El verbo patch sirve para actualizar parcialmente un recurso existente en un servidor. A diferencia de PUT, que reemplaza el recurso completo con la nueva representación enviada.
- PUT: reemplaza todo el recurso.
	Ejemplo: si un objeto tiene 10 atributos y envías solo 2, los otros 8 se perderán (a menos que los vuelvas a incluir).
- PATCH: actualiza solo los atributos enviados.
	Ejemplo: si un objeto tiene 10 atributos y envías 2, solo esos 2 cambian; los otros 8 permanecen igual.

*src\interface\http\middlewares\AuthMiddleware.ts*
- Middleware de autenticación y autorización. Deniega acceso si no hay token valido en la req del usuario o si el role que viene en la req no es el indicado.
- Uso de next() y next(err)
	- Si llamas next(err), Express salta la cadena normal y busca un middleware de manejo de errores (con firma (err, req, res, next)).
	- Cuando en un middleware de Express llamas a next(), lo que ocurre es que el flujo de ejecución pasa al siguiente middleware o handler registrado en la cadena de esa ruta

*src\domain\entities\Service.ts*
- Este es divertido, sin haber visto antes la ruta crei que service era un servicio. Pero no, la confusión se genero esta aplicación es para productos y servicios, pero se nombro como service a ambos.

- Cabe mencionar la división del proyecto. Dentro del dominio se encuentran entities (objetos identificables).

- El constructor de cada una de estas entidades es privado lo que significa que solo pueden implementarlo metodos internos.
- Ademas props es readonly lo que significa que no se cambiar de referencia a props.

- Sin embargo en la interface no se especifica que cada atributo sea readonly por lo que estos si podrian cambiarse de valor con el metodo settere adecuado.

- Un detalle mas es que quoteItem usa el id de Service pero no se maneja una relación explicita en los propios archivos entities. Peero es valido, esto con el fin de que sea pobre de dependencias externas(en este caso la persistencia) y rico en reglas de negocio

- Cabe destacar que erroneamente la mayoria de estas entidades son anemicas, no hacen validación de casi nada para la creación de instancias.
- Otro detalle es la definion de enums en el mismo archivo de la entity, si bien tiene mas cohesion es algo incomodo exportarlo desde ese archivo cuando se necesita en otras capas.

*src\domain\entities\Quote.ts*
- Hay una maquina de estados finita implementada, peeero no se validad todos los estados, como por ejemplo draft o sent.
- Adicionalmente es curioso que quote y quoteItem esten en un mismo archivo

*src\domain\interfaces\repositories\IClientRepository.ts*
- La interface de repositorie logra desacoplamiento entre la logica de negocio y la tecnologia o motor de DB.
- Interfaz para acceder y/o manipular datos en tablas especificas. Tiene los metodos de un CRUD, aunque no obligatoriamente estan todos implementados. Ej en algunas tabla no es necesario borrar directamente un elemento porque la logica dicta que será borrado por cascada.

*src\domain\interfaces\services\IPdfGeneratorService.ts*
- La interfaz de servies logra desacoplamiento entre la logica de negocios y los proveedores de servicios (whatsapp, pdfConverter, jwt, paswordHasher) en este caso.
- Me parece que es más facil de leer y entender el codigo separando las interfaces de los repositores de los servicios.


- TS fun fact: Esto se conoce como la dualidad de las clases en TS: son tantoc un valor en tiempo de ejecución como un tipo en tiempo de compilación.
Además, puedes usar una clase en anotaciones de tipo, en parámetros genéricos, o extenderla para crear nuevos tipos.


*src\infrastructure\repositories*
Uso especifico de prisma y sus implementaciones para interactuar con la persistencia de datos.

*src\infrastructure\security*
uso especifico de proveedor de jwt y bcrypt como password hasher

*src\infrastructure\services*
Uso especifico de API de wahtsapp y generador puppeteerPDF

*src\infrastructure\repositories\PrismaClientRepository.ts*
- el metodo create espera un tipo Promise<Client> de retorno pero se retorna Client as any, lo cual no es estrictamente correcto
- Para solucionar esto La idea es introducir un mapper o adaptador que traduzca entre el objeto plano que Prisma devuelve y tu entidad de dominio:

use cases = intern services
services as extern services


El dominio y la infraestructura nunca dependen uno del otro, se comunican por medio de interfaces e inyeccion de dependencias
