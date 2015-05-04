steal(
        'appdev'
).then( function(){

    // Namespacing conventions:
    // AD.Model.Base.extend("[application].[Model]" , { static }, {instance} );  --> Object
    AD.Model.Base.extend("opstools.RBAC.PermissionRole", {
        findAll: 'GET /appdev-core/permissionrole',
        findOne: 'GET /appdev-core/permissionrole/{id}',
        create:  'POST /appdev-core/permissionrole',
        update:  'PUT /appdev-core/permissionrole/{id}',
        destroy: 'DELETE /appdev-core/permissionrole/{id}',
        describe: function() {
            return {
                role_label : 'string',
                role_description : 'text'
            };
        },
        validations: {
            "role_label" : [ 'notEmpty' ],
            "role_description" : [ 'notEmpty' ]
        },
        fieldId:'id',
        fieldLabel:'role_label'
    },{
        model: function() {
            return AD.Model.get('opstools.RBAC.PermissionRole'); 
        },
        getID: function() {
            return this.attr(this.model().fieldId) || 'unknown id field';
        },
        getLabel: function() {
            return this.attr(this.model().fieldLabel) || 'unknown label field';
        },
        translate:function( lang_code ) {
            var _this = this;
            lang_code = lang_code || AD.lang.currentLanguage;
            var fields = ['role_label', 'role_description'];
            if (this.translations) {
                this.translations.forEach(function(trans){ 
                    if (trans.language_code == lang_code) {
                        fields.forEach(function(f){
                            // _this[f] = trans[f];
                            _this.attr(f, trans[f]);
                        })
                    }
                });
            }
        }
    });


});