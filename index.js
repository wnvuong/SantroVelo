var Hapi = require('hapi');
var Joi = require('joi');
var Pg = require('pg');

var pack = require('package'),
    swaggerOptions = {
        apiVersion: pack.version,
        info: {
          title: 'SantroVelo API Documentation',
          description: 'All public routes for access to the SantroVelo userbase'
        }
    };

var server = new Hapi.Server();
server.connection({ port: process.env.PORT });

server.route({
    method: 'GET',
    path: '/',
    config: {
      handler: function (request, reply) {

        reply({ 
        		status: 'success',
        		message: 'Hello, world!'
        	});
      }
    }
});


server.route({
  method: 'GET',
  path: '/users',
  config: {
    handler: function(request, reply) {
      Pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        // create table santro_test (id serial, LastName VARCHAR(255) NOT NULL, FirstName VARCHAR(255) NOT NULL, DateJoined DATE NOT NULL, Phone VARCHAR(10) NOT NULL, Valid BOOLEAN NOT NULL);
        var query = 'SELECT * FROM santro_test';
          client.query(query, function(err, result) {
              done();
              if (err)
              { 
                reply("Error " + err); 
              } else { 
                reply({
                  status: 'success',
                  message: result.rows
                }); 
              }
          });
      });
    },
    description: 'Gets all the members of SantroVelo',
    tags: ['api']
  }
});

server.route({
  method: 'GET',
  path: '/users/{id}',
  handler: function(request, reply) {
    Pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      
      var query = 'SELECT * FROM santro_test WHERE ' + request.params.id + '=id';
      var queryResult;
      var queryStatus;

      client.query(query, function(err, result) {
        done();
        if (err) {
          queryResult = 'failure',
          queryStatus = 'Query could not be completed'
        } else {
          queryResult = 'User not found';
          queryStatus = 'failure';

          if (result.rows.length > 0) {
            queryResult = result.rows[0];
            queryStatus = 'success';
          } 
          reply({
            status: queryStatus,
            message: queryResult
          });
        }
        
      });
    
    });
  }
});


server.route({
  method: 'POST',
  path: '/users',
  handler: function(request, reply) {
    var payload = request.payload;
    var invalid = '';

    if (payload.firstname == '' || payload.firstname  == null ) {
      invalid += 'firstname, ';
    }
    if (payload.lastname == '' || payload.lastname == null){
      invalid += 'lastname, ';
    } 
    if (payload.datejoined == '' || payload.datejoined == null) {
      invalid += 'datejoined, ';
    }
    if (payload.phone == '' || payload.phone == null) {
      invalid += 'phone, ';
    }
    if (payload.valid       == '' || payload.valid      == null) {
      invalid += 'valid'  
    }
    if (invalid != '') {
      reply({
            status: 'failure',
            message: 'The following fields are required ' + invalid
      });
    } else {
      Pg.connect(process.env.DATABASE_URL, function(err, client, done) {
  
        var query = 'INSERT INTO santro_test (Firstname, Lastname, DateJoined, Phone, Valid) values (\'' + 
          payload.firstname + '\',\'' +
          payload.lastname + '\',\'' +
          payload.datejoined + '\',\'' + 
          payload.phone +'\',\'' +
          payload.valid + '\');';

        client.query(query, function(err, result) {
          done();

          var queryStatus;
          var queryResult;
          
          if (err) {
            queryStatus = 'failure';
            queryResult = 'The user could not be added';
          } else {
            queryStatus = 'success',
            queryResult = 'The user has been added'
          }
          reply({
            status: queryStatus,
            message: queryResult
          });
        });
      });
    }
  }
})

server.register({
        register: require('hapi-swagger'),
        options: swaggerOptions
    }, function (err) {
        if (err) {
            server.log(['error'], 'hapi-swagger load error: ' + err)
        }else{
            server.log(['start'], 'hapi-swagger interface loaded')
        }
    });

server.start(function () {
    console.log('Server running at:', server.info.uri);
}); 