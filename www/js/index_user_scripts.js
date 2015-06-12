(function()
{
 "use strict";
 /*
   hook up event handlers 
 */
 function register_event_handlers()
 { 
    /* button  Volver */
    $(document).on("click", ".uib_w_9", function(evt)
    {
         activate_subpage("#principal"); 
    });
    
    /* button  Buscar */
    $(document).on("click", ".uib_w_6", function(evt)
    {
        var texto = $("#texto").val();
        var opcionBus = $("input[name='af-group-0']:checked").val();
        var opcionREs = $("input[name='af-group-1']:checked").val();
        
        // Validaciones y Ejecucion
        if (!texto || texto.length < 2) 
        {
            alert("Debe introducir al menos 2 caracteres");
            $("#texto").css("background", "red");
            $("#texto").css("color", "white");
        }
        else
        {
            /* Realizamos la Consulta en la BD */
            var result = mostrarResultado(opcionBus, opcionREs, texto);
            /* mostramos la pantalla de resultado */
            activate_subpage("#resultado"); 
        }
    });
     
    /* Busca texto */
    function mostrarResultado(opcionBus, opcionREs, texto)
    {
        var query;
        if (opcionBus == "a")
        {
            if (opcionREs == "a")
                query= "SELECT * FROM tablaA WHERE descripcion LIKE '%"+texto+"%' AND activo = 1"; 
            else if (opcionREs == "b")
                query= "SELECT * FROM tablaB WHERE codigoB IN (SELECT codigoA FROM tablaA WHERE descripcion LIKE '%"+texto+"%' AND  activo = 1) AND activo = 1"; 
        }
        else if (opcionBus == "b") 
        {
            if (opcionREs == "a")
                query= "SELECT * FROM tablaA WHERE codigoA IN (SELECT codigoB FROM tablaB WHERE descripcion LIKE '%"+texto+"%' AND  activo = 1) AND activo = 1"; 
            else if (opcionREs == "b")    
                query = "SELECT * FROM tablaB WHERE descripcion LIKE '%"+texto+"%' AND activo = 1";                 
        }
        
        //db = createTable();
        db.transaction(function (t) {
            t.executeSql(query, null, function (t, data) { 
                if (data.rows.length > 0)
                {                   
                    var html;  
                    if (opcionBus == "a")   
                    {
                        if (opcionREs == "a")
                            html = "<table class=\"tablaResultado\"><tr><td class=\"textleft\">Descripcion</td><td class=\"textcenter\">Activo</td><td class=\"textcenter\">CodigoA</td></tr>"; 
                        else if (opcionREs == "b")
                            html = "<table class=\"tablaResultado\"><tr><td class=\"textleft\">Descripcion</td><td class=\"textcenter\">Activo</td><td class=\"textcenter\">CodigoB</td></tr>";     
                    }
                    else if (opcionBus == "b") 
                    {
                        if (opcionREs == "a")
                            html = "<table class=\"tablaResultado\"><tr><td class=\"textleft\">Descripcion</td><td class=\"textcenter\">Activo</td><td class=\"textcenter\">CodigoB</td></tr>";                          
                        else if (opcionREs == "b")
                            html = "<table class=\"tablaResultado\"><tr><td class=\"textleft\">Descripcion</td><td class=\"textcenter\">Activo</td><td class=\"textcenter\">CodigoB</td></tr>";    
                    }
                    var codigo; 
                    for (var i = 0; i < data.rows.length; i++)
                    {                          
                        if (opcionBus == "a") 
                        {
                            if (opcionREs == "a")
                                codigo = data.rows.item(i).codigoA;
                            else if (opcionREs == "b")
                                codigo = data.rows.item(i).codigoB;
                        }
                        else if (opcionBus == "b") 
                        {
                            if (opcionREs == "a")
                                codigo = data.rows.item(i).codigoA;
                            else if (opcionREs == "b")
                                codigo = data.rows.item(i).codigoB;
                        }
                        html += "<tr><td class=\"textleft\">" + 
                        data.rows.item(i).descripcion + "</td><td class=\"textcenter\">" +
                        data.rows.item(i).activo + "</td><td class=\"textcenter\">" +
                        codigo + "</td></tr>";
                    }
                    html += "</table>";
                }
                else
                {
                     html = "<p class='textcenter'>No hay resultados</p>";
                }
                /* Imprimimos la consolta en el html */
                var tabla = document.getElementById("tabla");
                tabla.innerHTML = html;
            });
        });     
    }
     
    /* button  Limpiar */
    $(document).on("click", ".uib_w_7", function(evt)
    {
        $("#texto").val(''); 
        //$("#af-radio-0").attr('checked', true); 
        //chec$("#af-radio-2").attr('checked', true);  
    });
     
    /*::::::::::::::::::::::::::::
    :::::::Operaciones con BD:::::
    ::::::::::::::::::::::::::::*/
     
    /* Declaracion de variables */
    var db;
     
     /* Verifica si es compatible con HTML5 */
     function getopenDb() 
     { 
        try {
            if (window.openDatabase) {                    
                return window.openDatabase;                    
            } else {
                alert('No HTML5 support');
                return undefined;
            }
        }
        catch (e) {
            alert(e);
            return undefined;
        }            
     }
     
    /* Crear BD y Tablas */
    function createTable() 
    {
        var openDB = getopenDb();
        if(!openDB)
        {             
            return;
        }
        else
        {
            db = openDB('vcelulares', '1.0', 'my db', 2*1024*1024);
            db.transaction(function (t) { 
                t.executeSql('CREATE TABLE IF NOT EXISTS tablaA(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, descripcion TEXT NOT NULL, activo INT NOT NULL, codigoA INT NOT NULL, codigoB INT NULL);', [], null, null);  
                t.executeSql('CREATE TABLE IF NOT EXISTS tablaB(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, descripcion TEXT NOT NULL, activo INT NOT NULL, codigoA INT NULL, codigoB INT NOT NULL);', [], null, null); 
            });
            return db;           
        }         
    }
     
    /* Insertamos los Datos */
    function insert() 
    {
        if(!db)
        {                
            return;                
        }
        /*var queryA = [];
        queryA[1] = "INSERT INTO tablaA('descripcion','activo','codigoA','codigoB') values('Alondra común',0,1,null);";
        queryA[2] = "INSERT INTO tablaA('descripcion','activo','codigoA','codigoB') values('Anguila',0,2,null);";
        queryA[3] = "INSERT INTO tablaA('descripcion','activo','codigoA','codigoB') values('Garza imperial',1,3,null);";
        queryA[4] = "INSERT INTO tablaA('descripcion','activo','codigoA','codigoB') values('Garcilla cangrejera',1,4,null);";
        queryA[5] = "INSERT INTO tablaA('descripcion','activo','codigoA','codigoB') values('Cangrejo de río común',1,5,null);";
        queryA[6] = "INSERT INTO tablaA('descripcion','activo','codigoA','codigoB') values('Lobo de río',1,6,null);";
        queryA[7] = "INSERT INTO tablaA('descripcion','activo','codigoA','codigoB') values('Avetoro',1,7,null);";
        queryA[8] = "INSERT INTO tablaA('descripcion','activo','codigoA','codigoB') values('Sapo común',0,8,null);";
        queryA[9] = "INSERT INTO tablaA('descripcion','activo','codigoA','codigoB') values('Bucardo',1,9,null);";
        queryA[10] = "INSERT INTO tablaA('descripcion','activo','codigoA','codigoB') values('Pardillo común',0,10,null);";
        var queryB = [];
        queryB[1] = "INSERT INTO tablaB('descripcion','activo','codigoA','codigoB') values(' Alauda arvensis (Linnaeus, 1758)',0,null,11);";
        queryB[2] = "INSERT INTO tablaB('descripcion','activo','codigoA','codigoB') values('Anguilla anguilla (Linnaeus 1758)',0,null,10);";
        queryB[3] = "INSERT INTO tablaB('descripcion','activo','codigoA','codigoB') values('Ardea purpurea (Linnaeus, 1766)',1,null,9);";
        queryB[4] = "INSERT INTO tablaB('descripcion','activo','codigoA','codigoB') values('Ardeola ralloides (Scopoli,1769)',1,null,8);";
        queryB[5] = "INSERT INTO tablaB('descripcion','activo','codigoA','codigoB') values('Austropotamobius pallipes (Lereboullet, 1858)',1,null,7);";
        queryB[6] = "INSERT INTO tablaB('descripcion','activo','codigoA','codigoB') values('Barbatula barbatula (Linnaeus, 1758)',0,null,6);";
        queryB[7] = "INSERT INTO tablaB('descripcion','activo','codigoA','codigoB') values('Botaurus stellaris (Linnaeus, 1758)',0,null,5);";
        queryB[8] = "INSERT INTO tablaB('descripcion','activo','codigoA','codigoB') values('Bufo bufo (Linnaeus, 1758)',0,null,4);";
        queryB[9] = "INSERT INTO tablaB('descripcion','activo','codigoA','codigoB') values('Capra pyrenaica pyrenaica (Schinz, 1838)',0,null,3);";
        queryB[10] = "INSERT INTO tablaB('descripcion','activo','codigoA','codigoB') values('Carduelis cannabina (Linnaeus, 1758)',0,null,2);";*/
        
        var queryA = [];
        queryA[1] = "INSERT INTO tablaA('descripcion','activo','codigoA','codigoB') values('Alondra comun',0,1,null);";
        queryA[2] = "INSERT INTO tablaA('descripcion','activo','codigoA','codigoB') values('Anguila',0,2,null);";
        queryA[3] = "INSERT INTO tablaA('descripcion','activo','codigoA','codigoB') values('Garza imperial',1,3,null);";
        queryA[4] = "INSERT INTO tablaA('descripcion','activo','codigoA','codigoB') values('Garcilla cangrejera',1,4,null);";
        queryA[5] = "INSERT INTO tablaA('descripcion','activo','codigoA','codigoB') values('Cangrejo de rio comun',1,5,null);";
        queryA[6] = "INSERT INTO tablaA('descripcion','activo','codigoA','codigoB') values('Lobo de rio',1,6,null);";
        queryA[7] = "INSERT INTO tablaA('descripcion','activo','codigoA','codigoB') values('Avetoro',1,7,null);";
        queryA[8] = "INSERT INTO tablaA('descripcion','activo','codigoA','codigoB') values('Sapo comun',0,8,null);";
        queryA[9] = "INSERT INTO tablaA('descripcion','activo','codigoA','codigoB') values('Bucardo',1,9,null);";
        queryA[10] = "INSERT INTO tablaA('descripcion','activo','codigoA','codigoB') values('Pardillo comun',0,10,null);";
        var queryB = [];
        queryB[1] = "INSERT INTO tablaB('descripcion','activo','codigoA','codigoB') values(' Alauda arvensis (Linnaeus, 1758)',0,null,11);";
        queryB[2] = "INSERT INTO tablaB('descripcion','activo','codigoA','codigoB') values('Anguilla anguilla (Linnaeus 1758)',0,null,10);";
        queryB[3] = "INSERT INTO tablaB('descripcion','activo','codigoA','codigoB') values('Ardea purpurea (Linnaeus, 1766)',1,null,9);";
        queryB[4] = "INSERT INTO tablaB('descripcion','activo','codigoA','codigoB') values('Ardeola ralloides (Scopoli,1769)',1,null,8);";
        queryB[5] = "INSERT INTO tablaB('descripcion','activo','codigoA','codigoB') values('Austropotamobius pallipes (Lereboullet, 1858)',1,null,7);";
        queryB[6] = "INSERT INTO tablaB('descripcion','activo','codigoA','codigoB') values('Barbatula barbatula (Linnaeus, 1758)',0,null,6);";
        queryB[7] = "INSERT INTO tablaB('descripcion','activo','codigoA','codigoB') values('Botaurus stellaris (Linnaeus, 1758)',0,null,5);";
        queryB[8] = "INSERT INTO tablaB('descripcion','activo','codigoA','codigoB') values('Bufo bufo (Linnaeus, 1758)',0,null,4);";
        queryB[9] = "INSERT INTO tablaB('descripcion','activo','codigoA','codigoB') values('Capra pyrenaica pyrenaica (Schinz, 1838)',0,null,3);";
        queryB[10] = "INSERT INTO tablaB('descripcion','activo','codigoA','codigoB') values('Carduelis cannabina (Linnaeus, 1758)',0,null,2);";
        db.transaction(function (t) { 
            for (var i=1; i<=10; i++)
            {
                t.executeSql(queryA[i], [], null, null);
                t.executeSql(queryB[i], [], null, null);
            }
        });  
        /* Indicamos que ya se se inserto datos para que no lo vuelva hacer */
        localStorage.setItem("controlInicio", 1);
    }
     
    /* Borrado de Datos */
    function borrarDatosApp()
    {
        db = createTable();
        /* Borramos las Tablas */
        var query = [];
        query[1] = "DROP TABLE tablaA;";
        query[2] = "DROP TABLE tablaB;";
        db.transaction(function (t) { 
            for (var i=1; i<=2; i++)
            {
                t.executeSql(query[i], [], null, null);
            }
        });
        
        /* Limpiamos las variables locales */
        localStorage.clear();
    }
     
    /* Control de inicio app */
    function iniciarApp()
    {
        var controlInicio = localStorage.getItem("controlInicio");
        if(!controlInicio)
        {
            /* Creamos BD */
            db = createTable();
            insert();
        }
        else
        {            
            /* Inicializamos BD */
            db = createTable();
        }
    }
     
    /* Iniciamos la App */
    var iniciarApp = iniciarApp();
    var autocomplete = autocomplete();
    /* Borrado de Datos */
    //var borrarDatosApp = borrarDatosApp();
     
    /* Auto Complete */
    function autocomplete()
    {
        var query = "SELECT descripcion FROM tablaA WHERE activo = 1 UNION SELECT descripcion FROM tablaB WHERE activo = 1";
        var tags = [];
        //db = createTable();
        db.transaction(function (t) {
            t.executeSql(query, null, function (t, data) { 
                if (data.rows.length > 0)
                { 
                    for (var i = 0; i < data.rows.length; i++)
                        tags[i] = data.rows.item(i).descripcion;
                    $( "#texto" ).autocomplete({ 
                      source: function( request, response ) {
                              var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( request.term ), "i" );
                              response( $.grep( tags, function( item ){
                                  return matcher.test( item );
                              }) );
                          }
                    });
                }
            });
        });   
    }
 }
 document.addEventListener("app.Ready", register_event_handlers, false);
})();
