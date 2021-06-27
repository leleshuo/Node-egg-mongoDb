module.exports = (app) => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema
  const d = new Date()
  const User = new Schema({
    password: { type: String },
    phone: { type: Number },
    last_ip: { type: String },
    add_time: {
      type: Number,
      default: d.getTime(),
    },
    email: {
      type: String,
      default: '',
    },
    status: {
      type: Number,
      default: d.getTime(),
    },
    username: {
      type: String,
    },
  })

  return mongoose.model('User', User, 'user')
}
