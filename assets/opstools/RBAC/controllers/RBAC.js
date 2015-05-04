/* global AD */

steal(
        // List your Controller's dependencies here:
        'appdev',

        'opstools/RBAC/models/SiteUser.js',
        // 'opstools/RBAC/models/Permission.js',
        'opstools/RBAC/models/PermissionAction.js',
        'opstools/RBAC/models/PermissionRole.js',
        'opstools/RBAC/models/PermissionScope.js',

        'opstools/RBAC/controllers/Users.js',
        'opstools/RBAC/controllers/UserAssignmentAdd.js',
        'opstools/RBAC/controllers/Roles.js',
        'opstools/RBAC/controllers/RoleAdd.js',
        'opstools/RBAC/controllers/RoleEdit.js',
        '//opstools/RBAC/views/RBAC/RBAC.ejs',
function(){


    //
    // RBAC 
    // 
    // This is the OpsPortal Roles Based Access Control interface.
    //
    // This RBAC Controller is responsible for setting up the Application's
    // subcontrollers and managing the interactions between them.
    //



//// LEFT OFF: 
//// RoleEdit:save()    : make sure Multilingual labels get properly updated!  and Actions properly updated.

//// AD.Model.extend()  : look for multilingualFields:['fieldName'] and add a translate() to the instance definition
//// AD.Model.extend()  : if multilingualFields, then create() push values into translations:[] 
//// ALSO: implement manual name validation without letting server do it.



    // Namespacing conventions:
    // AD.Control.extend('[application].[controller]', [{ static },] {instance} );
    AD.Control.OpsTool.extend('RBAC', { 


        CONST: {
            ASSIGNMENTADD   : 'Assignment.Add',
            ASSIGNMENTADDED : 'Assignment.Added',

            ROLEADD         : 'Role.Add',
            ROLEADDED       : 'Role.Added',
            ROLEEDIT        : 'Role.Edit',

            DONE            : 'Done',       // generic Done event
            CANCEL          : 'Cancel'      // generic Cancel event
        }, 


        init: function (element, options) {
            var self = this;
            options = AD.defaults({
                    templateDOM: '//opstools/RBAC/views/RBAC/RBAC.ejs'
            }, options);
            this.options = options;

            // Call parent init
            // AD.classes.UIController.prototype.init.apply(this, arguments);
            this._super(element, options);

            this.portals = {};  // a hash of portals managed by RBAC:

            this.data = {};     // hold any data we are working with.
            this.data.permissions = [];  // all permission fields
            this.data.roles = [];   // all the roles in the system
            this.data.scopes = [];  // all the scopes in the db


            this.initDOM();
            this.initEvents();

            this.loadData();

            // default to User portal:
            this.portalShow('users');
        },



        initDOM: function () {
            var _this = this;

            this.element.html(can.view(this.options.templateDOM, {} ));

            
            var controllers = {
                'opstools.RBAC.Users'               : { el: '.rbac-users',          opt:{ eventAssignmentAdd:this.CONST.ASSIGNMENTADD } },
                'opstools.RBAC.UserAssignmentAdd'   : { el: '.rbac-addassignments', opt:{ eventAssignmentAdded:this.CONST.ASSIGNMENTADDED } },
                'opstools.RBAC.Roles'               : { el: '.rbac-roles',          opt:{ eventRoleAdd:this.CONST.ROLEADD, eventRoleEdit:this.CONST.ROLEEDIT }},
                'opstools.RBAC.RoleAdd'             : { el: '.rbac-role-addroles',  opt:{ eventRoleAdded:this.CONST.ROLEADDED, eventCancel:this.CONST.CANCEL }},
                'opstools.RBAC.RoleEdit'            : { el: '.rbac-role-editrole',  opt:{ eventDone:this.CONST.DONE, eventCancel:this.CONST.CANCEL }}
            }

            var initPortal = function(key, ref, el, options) {
                var Controller = AD.Control.get(ref);
                _this.portals[key] = new Controller( el, options );
            }

            for(var cKey in controllers) {
                var parts = cKey.split('.');
                var portal = parts.pop();
                
                initPortal(portal, cKey, controllers[cKey].el, controllers[cKey].opt);
            }
            

            
            // // attach the Users Controller
            // var Users = AD.Control.get('opstools.RBAC.Users');
            // this.portals.Users = new Users(this.element.find('.rbac-users'), { eventAssignmentAdd:this.CONST.ASSIGNMENTADD });

            // var UserAssignmentAdd = AD.Control.get('opstools.RBAC.UserAssignmentAdd');
            // this.portals.UserAssignmentAdd = new UserAssignmentAdd(this.element.find('.rbac-addassignments'), { eventAssignmentAdded:this.CONST.ASSIGNMENTADDED });

            // // attach the Roles Controller
            // var Roles = AD.Control.get('opstools.RBAC.Roles');
            // this.portals.Roles = new Roles(this.element.find('.rbac-roles'), { eventRoleAdd:this.CONST.ROLEADD, eventRoleEdit:this.CONST.ROLEEDIT });

            // // attach the RoleAdd Controller
            // var RoleAdd = AD.Control.get('opstools.RBAC.RoleAdd');
            // this.portals.RoleAdd = new RoleAdd(this.element.find('.rbac-role-addroles'), { eventRoleAdded:this.CONST.ROLEADDED, eventCancel:this.CONST.CANCEL });

            // // attach the RoleEdit Controller
            // var RoleEdit = AD.Control.get('opstools.RBAC.RoleEdit');
            // this.portals.RoleEdit = new RoleEdit(this.element.find('.rbac-role-editrole'), { eventDone:this.CONST.DONE, eventCancel:this.CONST.CANCEL });
            

        },



        initEvents: function () {
            var _this = this;


            //// 
            //// Users
            //// 

            // event: AssignmentAdd 
            // when the [+] icon is pressed, so we can add an assignment to this user.
            // @param: {obj} user  The user that will have an assignment added to.
            this.portals.Users.element.on(this.CONST.ASSIGNMENTADD, function(event, user) {

                console.log(' ... User Assignment Add : ', user);
                _this.portals.UserAssignmentAdd.loadUser(user);
                _this.portals.UserAssignmentAdd.__from = 'Users';  // mark the portal/controller we came from

                _this.portalShow('UserAssignmentAdd');
            });



            ////
            //// UserAssignmentAdd
            ////

            // event: AssignmentAdded 
            // event either [Save] or [Cancel] is processed.
            // @param: {model} permission  the newly created permission entry.
            this.portals.UserAssignmentAdd.element.on(this.CONST.ASSIGNMENTADDED, function(event, permission) {

                console.log(' ... User Assignment Add Return ');

                // if a permission was created, then
                if (permission) {

                    // load the new permission
                    _this.portals.Users.loadData( permission.id ); 
                    _this.portals.Users.refresh();                  

                }

                // return us to the controller we came from
                _this.portalShow(_this.portals.UserAssignmentAdd.__from);
            });



            ////
            //// Roles Controller
            //// 

            // event: RoleAdd 
            // when the [Add] button is pressed.
            this.portals.Roles.element.on(this.CONST.ROLEADD, function(event, role) {
                _this.portalShow('RoleAdd');
            })

            // event: RoleEdit
            // when the [edit] icon is pressed.
            // @param:  the role to edit
            this.portals.Roles.element.on(this.CONST.ROLEEDIT, function(event, role) {
                _this.portals.RoleEdit.loadRole(role);
                _this.portalShow('RoleEdit');
            })



            ////
            //// RoleAdd Controller
            ////

            // event: Cancel  
            // when the [Cancel] button is pressed.
            this.portals.RoleAdd.element.on(this.CONST.CANCEL, function(event) {
                _this.portalShow('Roles');
            })

            // event: RoleAdded  
            // when a role is successfully created
            // @param {obj} role :  the new instance of a role.
            this.portals.RoleAdd.element.on(this.CONST.ROLEADDED, function(event, role) {

                // Add new role to our list of roles
                _this.data.roles.push(role);
                _this.portalShow('Roles');
            })



            ////
            //// RoleEdit Controller
            ////

            // event: Cancel  
            // when the [Cancel] button is pressed.
            this.portals.RoleEdit.element.on(this.CONST.CANCEL, function(event) {
                _this.portalShow('Roles');
            })

            // event: Done  
            // when a role is successfully edited
            this.portals.RoleEdit.element.on(this.CONST.DONE, function(event) {
                _this.portalShow('Roles');
            })

        },



        loadData: function() {
            var _this = this;

            var User = AD.Model.get('opstools.RBAC.SiteUser');
            User.findAll()
            .fail(function(err){
//// TODO: handle Error properly!
            })
            .then(function(list){
                _this.portals.Users.loadUsers(list);
            });


            var Actions = AD.Model.get('opstools.RBAC.PermissionAction'); 
            Actions.findAll()
            .fail(function(err){

            })
            .then(function(list) {
                list.forEach(function(l) {
                    l.translate();
                })
                _this.portals.RoleAdd.loadActions(list);
                _this.portals.RoleEdit.loadActions(list);
                _this.data.actions = list; 
            });


            var Roles = AD.Model.get('opstools.RBAC.PermissionRole');
            Roles.findAll()
            .fail(function(err){
//// TODO: handle Error properly!
            })
            .then(function(list){
                // make sure they are all translated.
                list.forEach(function(l){
                    l.translate();
                })
                _this.portals.Users.loadRoles(list);
                _this.portals.UserAssignmentAdd.loadRoles(list);
                _this.portals.Roles.loadRoles(list);
                _this.data.roles = list;    
            });


            var Scopes = AD.Model.get('opstools.RBAC.PermissionScope');
            Scopes.findAll()
            .fail(function(err){
//// TODO: handle Error properly!
            })
            .then(function(list){
                // // make sure they are all translated.
                // list.forEach(function(l){
                //     l.translate();
                // })
                _this.portals.Users.loadScopes(list);
                _this.portals.UserAssignmentAdd.loadScopes(list);
                _this.data.scopes = list;    // all the 
            });


//             var Permissions = AD.Model.get('opstools.RBAC.Permission');
//             Permissions.findAll()
//             .fail(function(err){
// //// TODO: handle Error properly!
//             })
//             .then(function(list){
//                 _this.data.permissions = list;
//             })

        },



        portalShow: function(portalKey) {

            for (var p in this.portals) {
                if (p.toLowerCase() == portalKey.toLowerCase()) {

                    this.portals[p].show();
                } else {
                    this.portals[p].hide();
                }
            }

        },



        '.rbac-menu click': function ($el, ev) {

            var portal = $el.attr('portal');
            this.portalShow(portal);

            ev.preventDefault();
        }


    });


});