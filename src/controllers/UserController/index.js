const bcrypt = require('bcryptjs');
const User = require('@models/User');

class UserController {
  async store(req, res) {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });

    if (exists) {
      return res
        .status(401)
        .json({ message: 'email alredy exists, try again' });
    }

    const password_hash = await bcrypt.hash(password, 9);

    const user = new User({ name, email, password_hash });
    user.save();

    return res.status(201).json({ user });
  }

  async index(req, res) {
    const users = await User.find(
      {},
      { password_hash: 0, createdAt: 0, updatedAt: 0 },
    );
    if (!users) {
      return res.status(400).json({ message: "Users don't exists!" });
    }

    return res.status(200).json({ users });
  }

  async show(req, res) {
    const { email } = req.params;

    const user = await User.findOne({ email }, { password_hash: 0 });
    if (!user) {
      return res.status(400).json({ message: "User don't exists!" });
    }

    return res.status(200).json({ user });
  }

  async update(req, res) {
    const { name, email, password, newPassword, confirmNewPassword } = req.body;

    const user = await User.findOne({ _id: req.user._id });

    if (name) user.name = name;
    if (email) user.email = email;
    if (bcrypt.compare(password, user.password_hash)) {
      if (
        newPassword !== null &&
        newPassword !== undefined &&
        confirmNewPassword !== null &&
        confirmNewPassword !== undefined &&
        confirmNewPassword === newPassword
      ) {
        user.password_hash = await bcrypt.hash(newPassword, 9);
      } else {
        return res.status(401).json({ message: 'Passwords differents' });
      }
      user.save();
      return res.status(200).json({ message: 'Data updated with sucess' });
    }
    return res
      .status(401)
      .json({ message: 'Data updated with Password wrong' });
  }
}

module.exports = new UserController();
