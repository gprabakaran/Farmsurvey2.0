function myapp(client, userId) {

    Backbone.Force.initialize(client);

    var app = {}; // create namespace for our app

    //--------------
    // Models
    //--------------
    app.FarmSurvey = Backbone.Force.Model.extend({
        type: 'Farm_Survey__c',
        fields: ['Id', 'Name',
            'Prepared_for__c', 'prepared_for_phone__c', 'Intermediary__c', 'intermediary_phone__c', 'Date_of_Survey__c', 'Reference_Number__c', 'Policy_Number__c', 'situation__c', 'postcode__c', 'anszic_code__c',
            'housekeeping_impression__c', 'plan_to_minimise_risk__c', 'boundaries__c', 'boundary_compliance__c', 'boundary_comments__c', 'age_and_condition__c', 'age_and_condition_comments__c', 'roof_condition__c', 'roof_condition_comments__c', 'overhanging_branches__c', 'overhanging_branches_comments__c', 'gutters__c', 'elevation__c', 'unoccupied__c',
            'other_structures_insured__c', 'other_structures_good_condition__c',
            'frontage__c', 'fencing__c', 'non_farming_activity__c',
            'overall_assessment_rating__c', 'overall_assessment_comments__c',
            'policy_discount__c', 'Policy_Loading_Discounting__c', 'policy_discount_reasons__c', 'policy_discount_comments__c', 'Submitted__c',
            'liability_full_details__c','liability_farm_contracting__c','liability_farm_turnover__c','liability_labour_hire__c','liability_provide_full_details_work__c','other_structures_age_condition__c'
        ],
        required: [
            'Prepared_for__c', 'prepared_for_phone__c', 'Intermediary__c', 'intermediary_phone__c', 'Date_of_Survey__c', 'situation__c', 'postcode__c', 'anszic_code__c',
            'housekeeping_impression__c', 'plan_to_minimise_risk__c', 'boundaries__c', 'boundary_compliance__c', 'age_and_condition__c', 'roof_condition__c', 'overhanging_branches__c', 'gutters__c', 'elevation__c', 'unoccupied__c',
            'other_structures_insured__c', 'other_structures_good_condition__c',
            'frontage__c', 'fencing__c', 'non_farming_activity__c',
            'overall_assessment_rating__c',
            'policy_discount__c',
            'Submitted__c'
        ],
        incompleteFields: function () {
            var missingFields = new Array();
            for (var i = 0; i < this.required.length; i++) {
                if (this.get(this.required[i]) === undefined || this.get(this.required[i]) === null || this.get(this.required[i]) === '') {
                    missingFields.push(this.required[i]);
                }
            }
            return missingFields;
        }
    });

    app.FarmDwelling = Backbone.Force.Model.extend({
        type: 'Farm_Survey_Dwellings__c',
        fields: ['Id', 'Name', 'unique_name__c', 
            'property_occupancy__c', 'description__c', 'occupancy_status__c', 'how_long_unoccupied__c','how_long_anticipated__c','have_services_disconnected__c','how_ofen_inspected__c','construction__c', 'age__c', 'rewired__c','rewired_comments__c',
            'sum_insured__c', 'Latitude__c', 'Longitude__c', 'conditions__c', 'Farm_Survey__c'
        ],
        defaults: {
            'isDeleted': false,
            'unique_name__c': null,
            'property_occupancy__c': null,
            'description__c': null,
            'occupancy_status__c': null,
            'how_long_unoccupied__c' : null,
            'how_long_anticipated__c' : null,
            'have_services_disconnected__c' : null,
            'how_ofen_inspected__c' : null,
            'construction__c': null,
            'age__c': null,
            'rewired__c': null,
            'rewired_comments__c': null,
            'sum_insured__c': null,
            'Latitude__c': null,
            'Longitude__c': null,
            'conditions__c': null
        },
        toJSON: function (options) {
            var attr = _.clone(this.attributes);
            delete attr.isDeleted;
            return attr;
        }
    });

    app.FarmBuilding = Backbone.Force.Model.extend({
        type: 'Farm_Survey_Buildings__c',
        fields: ['Id', 'Name', 'unique_name__c',
            'description__c', 'construction_type__c', 'age__c',
            'sum_insured__c', 'Latitude__c', 'Longitude__c', 'conditions__c', 'Farm_Survey__c','renovations_maintenance_comments__c','renovations_maintenance__c'
        ],
        defaults: {
            'isDeleted': false,
            'unique_name__c': null,
            'description__c': null,
            'construction_type__c': null,
            'age__c': null,
            'renovations_maintenance__c': null,
            'renovations_maintenance_comments__c': null,
            'sum_insured__c': null,
            'Latitude__c': null,
            'Longitude__c': null,
            'conditions__c': null
        },
        toJSON: function (options) {
            var attr = _.clone(this.attributes);
            delete attr.isDeleted;
            return attr;
        }
    });
    
    app.Photo = Backbone.Force.Model.extend({
        type: 'Attachment',
        fields: ['Id', 'Name', 'ContentType', 'Body', 'ParentId'],
        defaults: { 'isDeleted' : false },
        photoUrl: function () {
            var instanceName = client.instanceUrl.split('.')[0].substring(8);
            var baseUrl = 'https://c.' + instanceName + '.content.force.com/servlet/servlet.FileDownload?file=';
            return baseUrl + this.get('Id');
        },
        toJSON: function (options) {
            var attr = _.clone(this.attributes);
            delete attr.isDeleted;
            return attr;
        }
    });

    //--------------
    // Collections
    //--------------
    app.FarmSurveysCollection = Backbone.Force.Collection.extend({
        model: app.FarmSurvey,
        query: "WHERE IsDeleted = false AND Submitted__c = false AND OwnerId = '" + userId + "'"
    });

    app.FarmDwellingsCollection = Backbone.Force.Collection.extend({
        model: app.FarmDwelling,
        query: "WHERE IsDeleted = false"
    });

    app.FarmBuildingsCollection = Backbone.Force.Collection.extend({
        model: app.FarmBuilding,
        query: "WHERE IsDeleted = false"
    });
    
    app.PhotosCollection = Backbone.Force.Collection.extend({
        model: app.Photo
    });

    //--------------
    // Views
    //--------------

    // renders individual Farm Survey list item (li)
    app.FarmSurveyView = Backbone.View.extend({
        tagName: 'li',
        template: _.template($('#farmsurvey-template').html()),
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this; // enable chained calls
        },
        initialize: function () {}
    });

    // renders the full list of Surveys calling FarmSurveyView for each one
    app.FarmSurveysView = Backbone.View.extend({
        template: _.template($('#farmsurveys-template').html()),
        initialize: function () {
            this.render();
            this.model.on('add', this.render, this);
            this.model.on('reset', this.render, this);
        },
        events: {
            'click .new': 'newFarmSurvey',
            'click .logout': 'logout'
        },
        renderOne: function (farmsurvey) {
            var view = new app.FarmSurveyView({
                model: farmsurvey
            });
            this.$('#farmsurvey-list').append(view.render().el);
        },
        render: function () {
            this.$el.html(this.template());
            this.$('#farmsurvey-list').empty();
            for (var i = 0, l = this.model.models.length; i < l; i++) {
                this.renderOne(this.model.models[i]);
            }
        },
        newFarmSurvey: function () {
            app.router.navigate('/new', true);
            return false;
        },
        logout: function () {
            salesforceLogout();
        }
    });

    // renders individual Farm Survey for editing
    app.FarmSurveyDetailView = Backbone.View.extend({
        template: _.template($('#farmsurvey-detail-template').html()),
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this; // enable chained calls
        },
        initialize: function () {
            this.model.on('destroy', this.remove, this);
            this.render();
        },
        events: {
            'change': 'change',
            'click .save': 'save',
            'click .submit': 'submit',
            'click .destroy': 'destroy'
        },
        change: function (event) {
            // Apply the change to the model
            var target = event.target;
            var change = {};
            change[target.name] = target.value;
            this.model.set(change);
        },
        submit: function () {
            this.model.set("Submitted__c", false);
            $('.incompleteField').removeClass('incompleteField');
            $('.incompleteCollapsible').removeClass('incompleteCollapsible');
            var fields = this.model.incompleteFields();
            if (fields.length > 0) {
                for (var i = 0; i < fields.length; i++) {
                    $('#' + fields[i]).addClass('incompleteField');
                    var parent = $('#' + fields[i]).parent();
                    if (!parent.hasClass('ui-collapsible-content')) {
                        parent.addClass('incompleteField');
                    }
                }
                var fieldsets = $('fieldset.ui-collapsible').has('.incompleteField').addClass('incompleteCollapsible');
                navigator.notification.alert( 'Please complete all the fields marked in red and then submit again' , null , 'FarmSurvey' , 'OK' );
            } else {
                this.model.set("Submitted__c", true);
                this.model.save(null, {
                    success: function (model) {
                        model.trigger('saved', {
                            model: model
                        });
                        app.router.navigate('farmsurveys', {
                            trigger: true
                        });
                        alert('success');
                    },
                    error: function () {
                        alert('Error saving survey');
                    }
                });
            }
            return false;
        },
        save: function () {
            $.mobile.loading("show", {
                text: 'Saving Survey',
                textVisible: true
            });
            this.model.save(null, {
                success: function (model) {
                    model.trigger('saved', {
                        model: model
                    });
                    $( document ).ajaxStop(function () {
                        $.mobile.loading("hide");
                        $( document ).off('ajaxStop');
                        app.router.navigate('farmsurveys', {
                            trigger: true
                        });
                    })
                    navigator.notification.alert( 'Your Survey is saved is successfully' , null , 'FarmSurvey' , 'OK' );
                },
                error: function () {
                    alert('Error saving survey');
                    app.router.navigate('/panel-fixed-page1', true);
                }
            });
            return false;
        },
        destroy: function () {            
            if (this.model.isNew()) {
                app.router.navigate('farmsurveys', {
                    trigger: true
                });
            }
            if (confirm("Are you sure you want to delete this Survey?")){
                alert("deleting");
                this.model.destroy({
                    success: function () {
                        app.router.navigate('farmsurveys', {
                            trigger: true
                        });
                        app.router.navigate('/panel-fixed-page1', true);
                    },
                    error: function () {
                        alert('Error deleting survey');
                    }
                });
            } else {
                return false;
            }
            return false;
        }
    });

    // renders the full list of Dwellings calling FarmDwellingDetailView for each one
    app.FarmDwellingsView = Backbone.View.extend({
        template: _.template($('#farmdwellings-template').html()),
        initialize: function () {
            this.render();
            this.model.on('add', this.render, this);
            this.model.on('reset', this.render, this);
            var view = this;
            this.options.farmSurvey.on('saved', function (model) {
                view.saveDwellings(model.model);
            });
        },
        events: {
            'click .new': 'newDwelling'
        },
        renderOne: function (farmdwelling) {
            var view = new app.FarmDwellingDetailView({
                model: farmdwelling
            });
            this.$('#farmdwelling-list').append(view.render().el);
            if (farmdwelling.get("Id") === undefined) {
                view.$el.find('fieldset').trigger('expand');
            }
        },
        render: function () {
            this.$el.html(this.template());
            this.$('#farmdwelling-list').empty();
            var dwellingsToRender = this.model.where({
                'isDeleted': false
            });
            for (var i = 0, l = dwellingsToRender.length; i < l; i++) {
                this.renderOne(dwellingsToRender[i]);
            }
            this.$el.trigger('create');
        },
        newDwelling: function () {
            var dwelling = new app.FarmDwelling();
            dwelling.photos = new app.PhotosCollection();
            this.model.push(dwelling);
        },
        saveDwellings: function (farmSurvey) {
            var dwellingsToSave = this.model.where({
                'isDeleted': false
            });
            var dwellingsToDelete = this.model.where({
                'isDeleted': true
            });
            for (var i = 0, l = dwellingsToSave.length; i < l; i++) {
                if (dwellingsToSave[i].get("Farm_Survey__c") == undefined) {
                    dwellingsToSave[i].set("Farm_Survey__c", farmSurvey.get("Id"));
                }
                dwellingsToSave[i].save(null, {
                    success: function (model) {
                        model.trigger('saved', {
                            model: model
                        });
                    },
                    error: function () { 
                        alert('Error saving dwelling' + error);
                    }
                });
            }
            for (var i = 0, l = dwellingsToDelete.length; i < l; i++) {
                dwellingsToDelete[i].destroy(null, {
                    success: function () {
            
                    },
                    error: function () {
                        alert('Error deleting dwelling123');
                    }
                });
            }
        }
    });

    // renders individual Farm Dwelling for editing
    app.FarmDwellingDetailView = Backbone.View.extend({
        template: _.template($('#farmdwelling-detail-template').html()),
        tagName: 'fieldset',
        attributes: {
            'data-role': 'collapsible'
        },
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            this.$('#dwelling-photos').html(new app.FarmPhotosView({
                model: this.model
            }).el);
            this.$el.trigger('create');
            var test = $(this.el).find('input[name=occupancy_status__c]:checked');
            if(test.val()=='No'){
                $(this.el).find('.remove').show();
            }
            if(test.val()=='Yes'){
                $(this.el).find('.remove').hide();
            }
            return this; // enable chained calls
        },
        initialize: function () {
            this.model.on('destroy', this.remove, this);
        },
        events: {
            'change': 'change',
            'click .delete': 'delete',
            'click .geolocate': 'geolocate',
            'change input[name=occupancy_status__c]' : 'onRadioClick'
        },
        change: function (event) {
            // Apply the change to the model
            var target = event.target;
            var change = {};
            change[target.name] = target.value;
            this.model.set(change);
            return false;
        },
       onRadioClick: function (evt) {
            if ($(evt.currentTarget).val()=='No'){
                $("#how_long_unoccupied").show();
                $("#how_long_anticipated").show();
                $("#have_services_disconnected").show();
                $("#how_ofen_inspected").show();
            }
            if ($(evt.currentTarget).val()=='Yes'){
                $("#how_long_unoccupied").hide();
                $("#how_long_anticipated").hide();
                $("#have_services_disconnected").hide();
                $("#how_ofen_inspected").hide();
            }
            if ($(evt.currentTarget).val()=='N/A'){
                $("#how_long_unoccupied").hide();
                $("#how_long_anticipated").hide();
                $("#have_services_disconnected").hide();
                $("#how_ofen_inspected").hide();
            }
        },
        geolocate: function () {
            $.mobile.loading("show", {
                text: 'Finding Location',
                textVisible: true
            });
            var Geo = {};
            var building = this.model;
            var view = this;

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(success, error);
            }

            //Get the latitude and the longitude;

            function success(position) {
                $.mobile.loading("hide");
                Geo.lat = position.coords.latitude;
                Geo.lng = position.coords.longitude;
                building.set("Latitude__c", Geo.lat);
                building.set("Longitude__c", Geo.lng);
                view.render();
            }

            function error() {
                $.mobile.loading("hide");
                alert("Geocoder failed");
            }

            return false;
        },
        delete: function () {
            this.model.set('isDeleted', true);
            this.remove();
            return false;
        }
    });
    
    // renders the full list of Buildings calling FarmBuildingDetailView for each one
    app.FarmBuildingsView = Backbone.View.extend({
        template: _.template($('#farmbuildings-template').html()),
        initialize: function () {
            this.render();
            this.model.on('add', this.render, this);
            this.model.on('reset', this.render, this);
            var view = this;
            this.options.farmSurvey.on('saved', function (model) {
                view.saveBuildings(model.model);
            });
        },
        events: {
            'click .new': 'newBuilding'
        },
        renderOne: function (farmbuilding) {
            var view = new app.FarmBuildingDetailView({
                model: farmbuilding
            });
            this.$('#farmbuilding-list').append(view.render().el);
        },
        render: function () {
            this.$el.html(this.template());
            this.$('#farmbuilding-list').empty();
            var buildingsToRender = this.model.where({
                'isDeleted': false
            });
            for (var i = 0, l = buildingsToRender.length; i < l; i++) {
                this.renderOne(buildingsToRender[i]);
            }
            this.$el.trigger('create');
        },
        newBuilding: function () {
            var building = new app.FarmBuilding();
            building.photos = new app.PhotosCollection();
            this.model.push(building);
        },
        saveBuildings: function (farmSurvey) {
            var buildingsToSave = this.model.where({
                'isDeleted': false
            });
            var buildingsToDelete = this.model.where({
                'isDeleted': true
            });
            for (var i = 0, l = buildingsToSave.length; i < l; i++) {
                if (buildingsToSave[i].get("Farm_Survey__c") == undefined) {
                    buildingsToSave[i].set("Farm_Survey__c", farmSurvey.get("Id"));
                }
                buildingsToSave[i].save(null, {
                    success: function (model) {
                        model.trigger('saved', {
                            model: model
                        });
                    },
                    error: function () {
                        alert('Error saving building');
                    }
                });
            }
            for (var i = 0, l = buildingsToDelete.length; i < l; i++) {
                buildingsToDelete[i].destroy(null, {
                    success: function () {

                    },
                    error: function () {
                        alert('Error deleting building');
                    }
                });
            }
        }
    });

    // renders individual Farm Building for editing
    app.FarmBuildingDetailView = Backbone.View.extend({
        template: _.template($('#farmbuilding-detail-template').html()),
        tagName: 'fieldset',
        attributes: {
            'data-role': 'collapsible'
        },
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            this.$el.trigger('create');
            
            this.$('#building-photos').html(new app.FarmPhotosView({
                model: this.model
            }).el);
            this.$('#building-photos').trigger('create');
            
            return this; // enable chained calls
        },
        initialize: function () {
            this.model.on('destroy', this.remove, this);
        },
        events: {
            'change': 'change',
            'click .delete': 'delete',
            'click .geolocate': 'geolocate'
        },
        change: function (event) {
            // Apply the change to the model
            var target = event.target;
            var change = {};
            change[target.name] = target.value;
            this.model.set(change);
            return false;
        },
        geolocate: function () {
            $.mobile.loading("show", {
                text: 'Finding Location',
                textVisible: true
            });
            var Geo = {};
            var building = this.model;
            var view = this;

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(success, error);
            }

            //Get the latitude and the longitude;

            function success(position) {
                $.mobile.loading("hide");
                Geo.lat = position.coords.latitude;
                Geo.lng = position.coords.longitude;
                building.set("Latitude__c", Geo.lat);
                building.set("Longitude__c", Geo.lng);
                view.render();
            }

            function error() {
                $.mobile.loading("hide");
                alert("Geocoder failed");
            }

            return false;
        },
        delete: function () {
            this.model.set('isDeleted', true);
            this.remove();
            return false;
        }
    });

    // renders a list of photos for a Farm Dwelling or Farm Building
    app.FarmPhotosView = Backbone.View.extend({
        template: _.template($('#farmphotos-template').html()),
        initialize: function () {
            this.model.photos.on('add', this.rerender, this);
            this.model.photos.on('reset', this.rerender, this);
            var view = this;
            this.model.on('saved', function () {
                view.savePhotos();
            });
            this.render();
        },
        render: function () {
            this.$el.html(this.template());
            this.$('#farmphotos-list').empty();
            var photosToRender = this.model.photos.where(
                { 'isDeleted': false }
            );
            for (var i = 0, l = photosToRender.length; i < l; i++) {
                this.renderOne(photosToRender[i]);
            }
        },
        rerender: function() {
            this.render();
            this.$el.trigger( 'create' );
        },
        renderOne: function (photo) {
            var view = new app.FarmPhotoDetailView({
                model: photo
            });
            this.$('#farmphotos-list').append(view.render().el);
        },
        events: {
			'click .takePhoto': 'takePhoto',
            'click .addPhoto': 'addPhoto'
        },
		takePhoto: function () {
		    navigator.camera.getPicture(success, fail, { quality : 50, destinationType: Camera.DestinationType.DATA_URL, sourceType: Camera.PictureSourceType.CAMERA });
            var photos = this.model.photos;
            var parent = this.model;
            
            function success(imageData) {
                var photo = new app.Photo();
                photo.set("ParentId", parent.get("Id"));
                photo.set("Id", null);
                photo.set("Body", imageData);
                photo.set("Name", "Photo.jpg");
                photo.set("ContentType", "image/jpeg");
                photos.add(photo);
            }
            
            function fail(message) {
                
            }
            return false;
		},
		addPhoto: function () {
		    navigator.camera.getPicture(success, fail, { quality : 50, destinationType:Camera.DestinationType.DATA_URL, sourceType: Camera.PictureSourceType.PHOTOLIBRARY });
            var photos = this.model.photos;
            var parent = this.model;
            
            function success(imageData) {
                var photo = new app.Photo();
                photo.set("ParentId", parent.get("Id"));
                photo.set("Id", null);
                photo.set("Body", imageData);
                photo.set("Name", "Photo.jpg");
                photo.set("ContentType", "image/jpeg");
                photos.add(photo);
            }
                        
            function fail(message) {
                
            }
            return false;
		},
        savePhotos: function () {
            var photosToSave = this.model.photos.where({
                'isDeleted' : false,
                'Id' : null             
            });
            var photosToDelete = this.model.photos.where({
                'isDeleted' : true 
            });
            for (var i = 0; i < photosToSave.length; i++) {
                if (photosToSave[i].get("ParentId") === undefined || photosToSave[i].get("ParentId") === null) {
                    photosToSave[i].set("ParentId", this.model.get("Id"));
                }
                photosToSave[i].save(null, {
                    success: function (model) {
                    },
                    error: function () {
                        alert('Error uploading photo');
                    }
                });
            }
            for (var i = 0; i < photosToDelete.length; i++) {
                photosToDelete[i].destroy(null, {
                    success: function () {
            
                    },
                    error: function () {
                        alert('Error deleting photo');
                    }
                });
            }
        }
    });    

    // renders individual photo for a Farm Dwelling or Farm Building
    app.FarmPhotoDetailView = Backbone.View.extend({
        tagName: 'li',
        attributes: {
            'data-role': 'fieldcontain'
        },
        template: _.template($('#farmphoto-template').html()),
        initialize: function () {
        },
        events: {
            'click .delete': 'delete'
        },
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            this.$el.trigger('create');
            return this; // enable chained calls
        },
        delete: function () {
            this.model.set('isDeleted', true);
            this.remove();
            return false;
        }
    });
    
    //Define the Application Router
    app.Router = Backbone.Router.extend({
        routes: {
            "": "farmsurveys",
            "farmsurveys": "farmsurveys",
            "new": "newFarmSurvey",
            ":id": "farmsurvey"
        },
        farmsurveys: function () {
            var farmsurveysCollection = new app.FarmSurveysCollection();
            $.mobile.loading("show", {
                text: 'Loading Surveys',
                textVisible: true
            });
            farmsurveysCollection.fetch({
                success: function () {
                    $.mobile.loading("hide");
                    $("#farmsurveys-content").html(new app.FarmSurveysView({
                        model: farmsurveysCollection
                    }).el);
                    // Let jQuery Mobile do its stuff
                    $("#farmsurveys-content").trigger('create');
                    $.mobile.changePage("#farmsurveys", {
                        reverse: false,
                        changeHash: false
                    });
                }
            });
        },
        farmsurvey: function (id) {
            var farmsurvey = new app.FarmSurvey({
                Id: id
            });
            $.mobile.loading("show", {
                text: 'Loading Survey',
                textVisible: true
            });
            farmsurvey.fetch({
                success: function () {
                    $.mobile.loading("hide");
                    $("#farmsurvey-content").html(new app.FarmSurveyDetailView({
                        model: farmsurvey
                    }).el);
                    $("#farmsurvey-content").trigger('create');
                    var farmDwellingsCollection = new app.FarmDwellingsCollection();
                    farmDwellingsCollection.query = "WHERE IsDeleted = false AND Farm_Survey__c = '" + farmsurvey.get("Id") + "'";
                    farmDwellingsCollection.fetch({
                        success: function (dwellings) {
                            var photosCollection = new app.PhotosCollection();
                            photosCollection.query = "WHERE IsDeleted = false AND ParentId IN (SELECT Id FROM Farm_Survey_Dwellings__c WHERE Farm_Survey__c = '" + farmsurvey.get("Id") + "')";
                            photosCollection.fetch({
                                success: function (photos) {
                                    for (var i = 0; i < dwellings.length; i++) {
                                        dwellings.models[i].photos = new app.PhotosCollection(photos.where( { "ParentId" : dwellings.models[i].get("Id") } ))
                                    }
                                    $('#farmdwellings-content').html(new app.FarmDwellingsView({
                                        model: dwellings,
                                        farmSurvey: farmsurvey
                                    }).el);
                                    $("#farmdwellings-content").trigger('create');
                                }
                            });
                        }
                    });
                    var farmBuildingsCollection = new app.FarmBuildingsCollection();
                    farmBuildingsCollection.query = "WHERE IsDeleted = false AND Farm_Survey__c = '" + farmsurvey.get("Id") + "'";
                    farmBuildingsCollection.fetch({
                        success: function (buildings) {
                            var photosCollection = new app.PhotosCollection();
                            photosCollection.query = "WHERE IsDeleted = false AND ParentId IN (SELECT Id FROM Farm_Survey_Buildings__c WHERE Farm_Survey__c = '" + farmsurvey.get("Id") + "')";
                            photosCollection.fetch({
                                success: function (photos) {
                                    for (var i = 0; i < buildings.length; i++) {
                                        buildings.models[i].photos = new app.PhotosCollection(photos.where( { "ParentId" : buildings.models[i].get("Id") } ))
                                    }
                                    $('#farmbuildings-content').html(new app.FarmBuildingsView({
                                        model: buildings,
                                        farmSurvey: farmsurvey
                                    }).el);
                                    $("#farmbuildings-content").trigger('create');
                                }
                            });
                        }
                    });
                    $.mobile.changePage("#farmsurvey", {
                        reverse: false,
                        changeHash: false
                    });
                }
            });
        },
        newFarmSurvey: function (id) {
            var farmsurvey = new app.FarmSurvey();
            $("#farmsurvey-content").empty();
            $("#farmsurvey-content").html(new app.FarmSurveyDetailView({
                model: farmsurvey
            }).el);
            $("#farmsurvey-content").trigger('create');
            var farmDwellingsCollection = new app.FarmDwellingsCollection();
            $('#farmdwellings-content').html(new app.FarmDwellingsView({
                model: farmDwellingsCollection,
                farmSurvey: farmsurvey
            }).el);
            $("#farmdwellings-content").trigger('create');
            var farmBuildingsCollection = new app.FarmBuildingsCollection();
            $('#farmbuildings-content').html(new app.FarmBuildingsView({
                model: farmBuildingsCollection,
                farmSurvey: farmsurvey
            }).el);
            $("#farmbuildings-content").trigger('create');
            $.mobile.changePage("#farmsurvey", {
                reverse: false,
                changeHash: false
            });
        }
    });

    app.router = new app.Router();
    Backbone.history.start();
}
