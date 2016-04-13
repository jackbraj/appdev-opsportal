steal(function() {
	System.import('appdev').then(function() {
		steal.import('appdev/model/model').then(function() {

			// Namespacing conventions:
			// AD.Model.Base.extend("[application].[Model]" , { static }, {instance} );  --> Object
			AD.Model.Base.extend("opstools.RBAC.PermissionScope", {
				findAll: 'GET /appdev-core/permissionscope',
				findOne: 'GET /appdev-core/permissionscope/{id}',
				create: 'POST /appdev-core/permissionscope',
				update: 'PUT /appdev-core/permissionscope/{id}',
				destroy: 'DELETE /appdev-core/permissionscope/{id}',
				describe: function() {
					return { 'label':'text', 'type':'string', 'definition':'json' };
				},
				associations:['object'], 
				multilingualFields:['label'], 
				// validations: {
				//     "role_label" : [ 'notEmpty' ],
				//     "role_description" : [ 'notEmpty' ]
				// },
				fieldId: 'id',
				fieldLabel: 'label'
			}, {
				// model: function() {
				//     return AD.Model.get('DelMe.PermissionScope'); //AD.models.DelMe.PermissionScope;
				// },
				// getID: function() {
				//     return this.attr(this.model().fieldId) || 'unknown id field';
				// },
				// getLabel: function() {
				//     return this.attr(this.model().fieldLabel) || 'unknown label field';
				// }
			});
		});
	});
});