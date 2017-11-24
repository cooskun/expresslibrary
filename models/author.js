const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;
const moment = require('moment');

const AuthorSchema = new Schema({
  first_name: {
    type: String,
    required: true,
    max: 100
  },
  family_name: {
    type: String,
    required: true,
    max: 100
  },
  date_of_birth: {
    type: Date
  },
  date_of_death: {
    type: Date
  }
});

//  Virtual for author's fullname
AuthorSchema
  .virtual('name')
  .get(function() {
    return this.family_name + ', ' + this.first_name;
  });

//  Virtual for author's URL
AuthorSchema
  .virtual('url')
  .get(function() {
    return '/catalog/author/' + this._id;
  });

AuthorSchema
  .virtual('birthday')
  .get(function() {
    return this.date_of_birth ? moment(this.date_of_birth).format('YYYY-MM-DD') : '';
  });

AuthorSchema
  .virtual('death')
  .get(function () {
    return this.date_of_death ? moment(this.date_of_death).format('YYYY-MM-DD') : '';
  });

AuthorSchema
  .virtual('lifespan')
  .get(function () {
    return this.death ? this.birthday + ' - ' + this.death : this.birthday;
  });

//  Export Model
module.exports = mongoose.model('Author', AuthorSchema);
