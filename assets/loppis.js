/* jshint ignore:start */

/* jshint ignore:end */

define('loppis/adapters/application', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	exports['default'] = DS['default'].FixtureAdapter.extend({});

});
define('loppis/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'loppis/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

  'use strict';

  Ember['default'].MODEL_FACTORY_INJECTIONS = true;

  var App = Ember['default'].Application.extend({
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix,
    Resolver: Resolver['default']
  });

  loadInitializers['default'](App, config['default'].modulePrefix);
  alert("hej");
  exports['default'] = App;

});
define('loppis/controllers/application', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Controller.extend({
    actions: {
      newP: function () {
        var self = this;
        var purchase = this.store.createRecord("purchase", {
          total: 0
        });
        //purchase.save().then(function(purchase) {
        self.transitionToRoute("purchase.items", purchase.get("id"));
        //},
        //function(error) {
        //  console.log('Failed to create new purchase');
        //});
      }
    }
  });

});
define('loppis/controllers/purchase', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].ObjectController.extend({
    actions: {
      newPurchase: function () {}
    }
  });

});
define('loppis/controllers/purchase/items', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].ArrayController.extend({
    needs: "purchase",
    purchase: Ember['default'].computed.alias("controllers.purchase.model"),

    actions: {

      add: function () {
        var self = this;
        var sellerId = this.get("seller");
        var price = this.get("price");
        if (!price) {
          alert("Ogiltigt pris, försök igen");
          return false;
        }
        price = price * 1;
        var purchase = this.get("purchase");
        if (!sellerId) {
          console.log("setting default seller");
          sellerId = -1;
        }
        this.store.find("seller", sellerId).then(function (seller) {
          var item = self.store.createRecord("item", {
            seller: seller,
            price: price,
            purchase: purchase
          });
          // save item
          // update purchase items and total
          item.save().then(function (newItem) {
            console.log("saved new item with price: " + price);
            purchase.get("items").then(function (items) {
              items.addObject(newItem);
              purchase.set("count", items.length);
              var total = purchase.get("total");
              total += price;
              purchase.set("total", total);

              purchase.save().then(function () {
                console.log("saved purchase with new total: " + total);
                self.set("seller", "");
                self.set("price", "");
                //TODO seller focus
              }, function (error) {
                console.log("Failed to save purchase " + error);
              });
            });
          }, function (error) {
            console.log("Failed to save item " + error);
          });
        }, function () {
          alert("Hittar ingen säljare, kolla igen eller lämna tomt");
        });
      }
    }
  });

});
define('loppis/initializers/app-version', ['exports', 'loppis/config/environment', 'ember'], function (exports, config, Ember) {

  'use strict';

  var classify = Ember['default'].String.classify;

  exports['default'] = {
    name: "App Version",
    initialize: function (container, application) {
      var appName = classify(application.toString());
      Ember['default'].libraries.register(appName, config['default'].APP.version);
    }
  };

});
define('loppis/initializers/export-application-global', ['exports', 'ember', 'loppis/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize(container, application) {
    var classifiedName = Ember['default'].String.classify(config['default'].modulePrefix);

    if (config['default'].exportApplicationGlobal && !window[classifiedName]) {
      window[classifiedName] = application;
    }
  };

  exports['default'] = {
    name: "export-application-global",

    initialize: initialize
  };

});
define('loppis/models/item', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  var Item = DS['default'].Model.extend({
    seller: DS['default'].belongsTo("seller", { async: true }),
    price: DS['default'].attr("number"),
    purchase: DS['default'].belongsTo("purchase")
  });

  Item.reopenClass({
    FIXTURES: [{ id: "1", price: 2, seller: "1", purchase: "1" }, { id: "2", price: 3, seller: "1", purchase: "2" }, { id: "3", price: 6, seller: "2", purchase: "2" }, { id: "4", price: 4, seller: "2", purchase: "2" }]
  });

  exports['default'] = Item;

});
define('loppis/models/list', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	exports['default'] = DS['default'].Model.extend({});

});
define('loppis/models/purchase', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  var Purchase = DS['default'].Model.extend({
    items: DS['default'].hasMany("item", { async: true }),
    comment: DS['default'].attr("string"),
    total: DS['default'].attr("number"),
    count: DS['default'].attr("number")
  });

  Purchase.reopenClass({
    FIXTURES: [{ id: "1", total: 2, comment: "1", items: ["1"], count: 1 }, { id: "2", total: 13, comment: "2", items: ["2", "3", "4"], count: 3 }]
  });

  exports['default'] = Purchase;

});
define('loppis/models/seller', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  var Seller = DS['default'].Model.extend({
    total: DS['default'].attr("number"),
    items: DS['default'].hasMany("item", { async: true }),
    paid: DS['default'].attr("boolean"),
    comment: DS['default'].attr("string")
  });

  Seller.reopenClass({
    FIXTURES: [{ id: "-1", total: 0, paid: "false", items: ["1", "2"] }, { id: "1", total: 5, paid: "false", items: ["1", "2"] }, { id: "2", total: 10, paid: "true", items: ["4", "3"] }]
  });

  exports['default'] = Seller;

});
define('loppis/router', ['exports', 'ember', 'loppis/config/environment'], function (exports, Ember, config) {

  'use strict';

  var Router = Ember['default'].Router.extend({
    location: config['default'].locationType
  });

  Router.map(function () {
    this.resource("purchase", {
      path: ":id"
    }, function () {
      this.route("items");
      this.route("new");
    });
    this.resource("list", function () {});
    this.route("new");
  });

  exports['default'] = Router;

});
define('loppis/routes/list', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    model: function () {
      return this.store.find("purchase");
    }
  });

});
define('loppis/routes/purchase', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    model: function (params) {
      return this.store.find("purchase", params.id);
    }
  });

});
define('loppis/routes/purchase/items', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Route.extend({
    model: function () {
      var purchase = this.modelFor("purchase");
      return purchase.get("items");
    }
  });

});
define('loppis/templates/application', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


    data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "p-header", options) : helperMissing.call(depth0, "partial", "p-header", options))));
    data.buffer.push("\n\n<div class=\"container\">\n\n  ");
    stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n\n</div>\n\n\n\n");
    return buffer;
    
  });

});
define('loppis/templates/list', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    var buffer = '', stack1, self=this, helperMissing=helpers.helperMissing;

  function program1(depth0,data) {
    
    var buffer = '', stack1, helper, options;
    data.buffer.push("\n    <div>\n\n      <h4>\n      ");
    stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "purchase.items", "p", options) : helperMissing.call(depth0, "link-to", "purchase.items", "p", options));
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n\n      </h4>\n      <hr>\n    </div>\n  ");
    return buffer;
    }
  function program2(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n        ");
    stack1 = helpers._triageMustache.call(depth0, "p.total", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push(" kr (");
    stack1 = helpers._triageMustache.call(depth0, "p.count", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push(")\n      ");
    return buffer;
    }

    data.buffer.push("<div>\n  <h1>Alla köp</h1>\n  <hr>\n</div>\n\n<div>\n\n  ");
    stack1 = helpers.each.call(depth0, "p", "in", "model", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n\n\n\n</div>\n\n");
    stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n");
    return buffer;
    
  });

});
define('loppis/templates/p-header', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

  function program1(depth0,data) {
    
    
    data.buffer.push("Marknad");
    }

    data.buffer.push("<nav class=\"navbar navbar-default\" role=\"navigation\">\n  <div class=\"container-fluid\">\n    <!-- Brand and toggle get grouped for better mobile display -->\n    <div class=\"navbar-header\">\n      <button ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "newP", "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
    data.buffer.push(" class=\"navbar-btn btn btn-default pull-right\">Nytt köp</button>\n      <button type=\"button\" class=\"navbar-toggle collapsed\" data-toggle=\"collapse\" data-target=\"#navbar-collapse\">\n        <span class=\"sr-only\">Visa meny</span>\n        <span class=\"icon-bar\"></span>\n        <span class=\"icon-bar\"></span>\n        <span class=\"icon-bar\"></span>\n      </button>\n      ");
    stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{
      'class': ("navbar-brand")
    },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "list", options) : helperMissing.call(depth0, "link-to", "list", options));
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n    </div>\n\n    <!-- Collect the nav links, forms, and other content for toggling -->\n    <div class=\"collapse navbar-collapse\" id=\"navbar-collapse\">\n\n      <ul class=\"nav navbar-nav navbar-right\">\n        <!--<li><button class=\"navbar-btn btn btn-default\">Nytt köp</button></li>-->\n        <li class=\"dropdown\">\n          <a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">Meny <span class=\"caret\"></span></a>\n          <ul class=\"dropdown-menu\" role=\"menu\">\n            <li><a href=\"#\">Synka köp</a></li>\n            <li><a href=\"#\">Räkna ihop</a></li>\n          </ul>\n        </li>\n      </ul>\n    </div><!-- /.navbar-collapse -->\n  </div><!-- /.container-fluid -->\n</nav>\n");
    return buffer;
    
  });

});
define('loppis/templates/purchase', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    var buffer = '', stack1, self=this;

  function program1(depth0,data) {
    
    var buffer = '', stack1;
    data.buffer.push("\n  <tr class=\"item\">\n    <td>");
    stack1 = helpers._triageMustache.call(depth0, "item.seller.id", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("</td>\n    <td>");
    stack1 = helpers._triageMustache.call(depth0, "item.price", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("</td>\n    <td></td>\n  </tr>\n  ");
    return buffer;
    }

    data.buffer.push("<table class=\"table table-striped\">\n  <thead>\n  ");
    stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n  </thead>\n  <tbody>\n  ");
    stack1 = helpers.each.call(depth0, "item", "in", "items", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n  </tbody>\n</table>\n\n");
    return buffer;
    
  });

});
define('loppis/templates/purchase/items', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
  helpers = this.merge(helpers, Ember['default'].Handlebars.helpers); data = data || {};
    var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


    data.buffer.push("<form role=\"form\" class=\"\">\n  <tr>\n    <td>\n      ");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
      'value': ("seller"),
      'type': ("number"),
      'id': ("seller"),
      'placeholder': ("Sälj nr"),
      'class': ("form-control")
    },hashTypes:{'value': "ID",'type': "STRING",'id': "STRING",'placeholder': "STRING",'class': "STRING"},hashContexts:{'value': depth0,'type': depth0,'id': depth0,'placeholder': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("\n    </td>\n    <td>\n      ");
    data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
      'value': ("price"),
      'type': ("number"),
      'step': ("5"),
      'placeholder': ("Pris"),
      'class': ("form-control")
    },hashTypes:{'value': "ID",'type': "STRING",'step': "STRING",'placeholder': "STRING",'class': "STRING"},hashContexts:{'value': depth0,'type': depth0,'step': depth0,'placeholder': depth0,'class': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
    data.buffer.push("\n    </td>\n    <td>\n      <button ");
    data.buffer.push(escapeExpression(helpers.action.call(depth0, "add", "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
    data.buffer.push(" class=\"btn btn-success\">\n        <i class=\"glyphicon glyphicon-plus\"></i>\n      </button>\n    </td>\n  </tr>\n</form>\n");
    stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("\n");
    return buffer;
    
  });

});
define('loppis/tests/adapters/application.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/application.js should pass jshint', function() { 
    ok(true, 'adapters/application.js should pass jshint.'); 
  });

});
define('loppis/tests/app.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('app.js should pass jshint', function() { 
    ok(true, 'app.js should pass jshint.'); 
  });

});
define('loppis/tests/controllers/application.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/application.js should pass jshint', function() { 
    ok(true, 'controllers/application.js should pass jshint.'); 
  });

});
define('loppis/tests/controllers/purchase.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/purchase.js should pass jshint', function() { 
    ok(true, 'controllers/purchase.js should pass jshint.'); 
  });

});
define('loppis/tests/controllers/purchase/items.jshint', function () {

  'use strict';

  module('JSHint - controllers/purchase');
  test('controllers/purchase/items.js should pass jshint', function() { 
    ok(true, 'controllers/purchase/items.js should pass jshint.'); 
  });

});
define('loppis/tests/helpers/resolver', ['exports', 'ember/resolver', 'loppis/config/environment'], function (exports, Resolver, config) {

  'use strict';

  var resolver = Resolver['default'].create();

  resolver.namespace = {
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix
  };

  exports['default'] = resolver;

});
define('loppis/tests/helpers/resolver.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/resolver.js should pass jshint', function() { 
    ok(true, 'helpers/resolver.js should pass jshint.'); 
  });

});
define('loppis/tests/helpers/start-app', ['exports', 'ember', 'loppis/app', 'loppis/router', 'loppis/config/environment'], function (exports, Ember, Application, Router, config) {

  'use strict';



  exports['default'] = startApp;
  function startApp(attrs) {
    var application;

    var attributes = Ember['default'].merge({}, config['default'].APP);
    attributes = Ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    Ember['default'].run(function () {
      application = Application['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }

});
define('loppis/tests/helpers/start-app.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/start-app.js should pass jshint', function() { 
    ok(true, 'helpers/start-app.js should pass jshint.'); 
  });

});
define('loppis/tests/models/item.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/item.js should pass jshint', function() { 
    ok(true, 'models/item.js should pass jshint.'); 
  });

});
define('loppis/tests/models/list.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/list.js should pass jshint', function() { 
    ok(true, 'models/list.js should pass jshint.'); 
  });

});
define('loppis/tests/models/purchase.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/purchase.js should pass jshint', function() { 
    ok(true, 'models/purchase.js should pass jshint.'); 
  });

});
define('loppis/tests/models/seller.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/seller.js should pass jshint', function() { 
    ok(true, 'models/seller.js should pass jshint.'); 
  });

});
define('loppis/tests/router.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('router.js should pass jshint', function() { 
    ok(true, 'router.js should pass jshint.'); 
  });

});
define('loppis/tests/routes/list.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/list.js should pass jshint', function() { 
    ok(true, 'routes/list.js should pass jshint.'); 
  });

});
define('loppis/tests/routes/purchase.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/purchase.js should pass jshint', function() { 
    ok(true, 'routes/purchase.js should pass jshint.'); 
  });

});
define('loppis/tests/routes/purchase/items.jshint', function () {

  'use strict';

  module('JSHint - routes/purchase');
  test('routes/purchase/items.js should pass jshint', function() { 
    ok(true, 'routes/purchase/items.js should pass jshint.'); 
  });

});
define('loppis/tests/test-helper', ['loppis/tests/helpers/resolver', 'ember-qunit'], function (resolver, ember_qunit) {

	'use strict';

	ember_qunit.setResolver(resolver['default']);

});
define('loppis/tests/test-helper.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('test-helper.js should pass jshint', function() { 
    ok(true, 'test-helper.js should pass jshint.'); 
  });

});
define('loppis/tests/unit/adapters/application-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("adapter:application", "ApplicationAdapter", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var adapter = this.subject();
    assert.ok(adapter);
  });
  // Specify the other units that are required for this test.
  // needs: ['serializer:foo']

});
define('loppis/tests/unit/adapters/application-test.jshint', function () {

  'use strict';

  module('JSHint - unit/adapters');
  test('unit/adapters/application-test.js should pass jshint', function() { 
    ok(true, 'unit/adapters/application-test.js should pass jshint.'); 
  });

});
define('loppis/tests/unit/controllers/application-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:application", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('loppis/tests/unit/controllers/application-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/application-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/application-test.js should pass jshint.'); 
  });

});
define('loppis/tests/unit/controllers/purchase-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:purchase", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('loppis/tests/unit/controllers/purchase-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/purchase-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/purchase-test.js should pass jshint.'); 
  });

});
define('loppis/tests/unit/controllers/purchase/items-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:purchase/items", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('loppis/tests/unit/controllers/purchase/items-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers/purchase');
  test('unit/controllers/purchase/items-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/purchase/items-test.js should pass jshint.'); 
  });

});
define('loppis/tests/unit/models/item-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("item", {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test("it exists", function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('loppis/tests/unit/models/item-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/item-test.js should pass jshint', function() { 
    ok(true, 'unit/models/item-test.js should pass jshint.'); 
  });

});
define('loppis/tests/unit/models/list-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("list", {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test("it exists", function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('loppis/tests/unit/models/list-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/list-test.js should pass jshint', function() { 
    ok(true, 'unit/models/list-test.js should pass jshint.'); 
  });

});
define('loppis/tests/unit/models/purchase-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("purchase", {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test("it exists", function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('loppis/tests/unit/models/purchase-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/purchase-test.js should pass jshint', function() { 
    ok(true, 'unit/models/purchase-test.js should pass jshint.'); 
  });

});
define('loppis/tests/unit/models/seller-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("seller", {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test("it exists", function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('loppis/tests/unit/models/seller-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/seller-test.js should pass jshint', function() { 
    ok(true, 'unit/models/seller-test.js should pass jshint.'); 
  });

});
define('loppis/tests/unit/routes/list-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:list", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('loppis/tests/unit/routes/list-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/list-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/list-test.js should pass jshint.'); 
  });

});
define('loppis/tests/unit/routes/new-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:new", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('loppis/tests/unit/routes/new-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/new-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/new-test.js should pass jshint.'); 
  });

});
define('loppis/tests/unit/routes/purchase-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:purchase", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('loppis/tests/unit/routes/purchase-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/purchase-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/purchase-test.js should pass jshint.'); 
  });

});
define('loppis/tests/unit/routes/purchase/items-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:purchase/items", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('loppis/tests/unit/routes/purchase/items-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/purchase');
  test('unit/routes/purchase/items-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/purchase/items-test.js should pass jshint.'); 
  });

});
define('loppis/tests/unit/routes/purchase/new-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:purchase/new", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('loppis/tests/unit/routes/purchase/new-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/purchase');
  test('unit/routes/purchase/new-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/purchase/new-test.js should pass jshint.'); 
  });

});
/* jshint ignore:start */

/* jshint ignore:end */

/* jshint ignore:start */

define('loppis/config/environment', ['ember'], function(Ember) {
  var prefix = 'loppis';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (runningTests) {
  require("loppis/tests/test-helper");
} else {
  require("loppis/app")["default"].create({"name":"loppis","version":"0.0.0.e61d36cb"});
}

/* jshint ignore:end */
//# sourceMappingURL=loppis.map