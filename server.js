var express = require('express');
var DataTypes = require('sequelize');
var app = express();
var bodyParser = require('body-parser');

// Or you can simply use a connection uri
var sequelize = new DataTypes('postgres://postgres:123456@localhost:5432/mapAngular');
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

//Cria a tabela "crm_desenvolvimento" com os campos id + type + data
var markerMaps = sequelize.define("markerMaps", {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true // id[x] ++
    },
    ordem: DataTypes.INTEGER,
    dia: DataTypes.STRING,
    //latitude: DataTypes.STRING, // a muito grosso modo é onde será colocado o  "assunto da linha" ex: 'doc.crm.cliente'
    //longitude: DataTypes.STRING, // a muito grosso modo é onde será colocado o  "assunto da linha" ex: 'doc.crm.cliente'
   coords: DataTypes.JSONB,
    title: DataTypes.STRING, // a muito grosso modo é onde será colocado o  "assunto da linha" ex: 'doc.crm.cliente'
    icon: DataTypes.STRING, // a muito grosso modo é onde será colocado o  "assunto da linha" ex: 'doc.crm.cliente'
    templateUrl: DataTypes.STRING,
    options:DataTypes.JSONB
}, {
    tableName: 'markermaps',
    paranoid: true // retorna apenas os campos "não deletados", na verdade nenhum dado e deletado. E colocado uma data
                   // na coluna deletedAt, isso é como se o dado fosse apagado, mas continua na base para histórico.
                   // se o campo deletedAt estiver vazio e pq ele ainda é valido.
});

//Cria a tabela "crm_desenvolvimento" com os campos id + type + data
var polyline = sequelize.define("polyline", {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true // id[x] ++
        },
        coords: DataTypes.JSONB
    },
    {
    tableName: 'polyline',
    paranoid: true // retorna apenas os campos "não deletados", na verdade nenhum dado e deletado. E colocado uma data
                   // na coluna deletedAt, isso é como se o dado fosse apagado, mas continua na base para histórico.
                   // se o campo deletedAt estiver vazio e pq ele ainda é valido.
});

app.get("/reset", function (req, res) {
    markerMaps.sync({force: true}).then(function () {
        // Table created
        var docs = require('./loadMarker.json');
        for (var i = 0; i < docs.length; i++) {
            if (docs[i] != null)
                markerMaps.create({
                    id: docs[i].id,
                    ordem: docs[i].ordem,
                    dia: docs[i].dia,
                    coords: docs[i].coords,
                    title: docs[i].title,
                    icon: docs[i].icon,
                    templateUrl:docs[i].templateUrl,
                    options:docs[i].options,
                });
        }
    });



    res.json('Configuração Padrão');
});
app.get("/polilynes", function (req, res) {
    sequelize.query("SELECT * FROM polyline").then(function (myTableRows) {
        res.json(myTableRows);
    })
});

app.post("/salvarPoly", function (req, res) {
    console.log(req.body);
    polyline.sync({force: true}).then(function () {
        // Table created
        if (req.body != null)
            polyline.create({
                id: 0,
                coords: req.body
            });
    });
});


app.get("/bancodados", function (req, res) {
    sequelize.query("SELECT * FROM markermaps where ordem > 0 order by ordem ").then(function (myTableRows) {
        res.json(myTableRows);
    })
});

app.get("/limpar", function (req, res) {
    sequelize.query("UPDATE markermaps SET ordem = 0 ").then(function () {
        res.json('Tudo Limpo');
    })
});

app.get("/alterarUm/:ordem/:id/:latitude/:longitude", function (req, res) {
    sequelize.query("UPDATE markermaps SET latitude=" + req.params.latitude + ",longitude=" + req.params.longitude + ", ordem= " + req.params.ordem + ", title='Nova Ordem: " + req.params.ordem + "' where id=" + req.params.id).then(function () {
        res.json('Ponto Atualizado');
    })
});

app.get("/salvar/:latitude/:longitude/:title", function (req, res) {
    sequelize.query("Insert into  markermaps (id,ordem,latitude,longitude,title,icon) VALUES (0,0,'"+ req.params.latitude+"','"+ req.params.longitude+"','"+ req.params.title+"','marker/h.png')").then(function () {
        res.json('Ponto Inserido');
    })



});

var port = process.env.PORT || 3000;


app.listen(port, function () {
    console.log(" Escutando a porta " + port);
});
