const CreateUserService = require('@service/CreateUserService');
const ListAllUsersService = require('@service/ListAllUsersService');
const ShowUserByEmail = require('@service/ShowUserByEmail');

const UpdateUserService = require('@service/UpdateUserService');

class UserController {
  async store(request, response) {
    try {
      const { name, email, password } = request.body;

      const showUserByEmail = new ShowUserByEmail();
      const userExists = await showUserByEmail.execute({ email });

      if (userExists) {
        return response
          .status(400)
          .json({ error: 'O email já está cadastrado!' });
      }

      const createUserService = new CreateUserService();

      const user = await createUserService.execute({ name, email, password });

      return response.status(201).json(user);
    } catch (err) {
      const messageError = err.message;

      return response.status(400).json({ error: messageError });
    }
  }

  async index(request, response) {
    try {
      const listAllUserService = new ListAllUsersService();

      const users = await listAllUserService.execute(
        {},
        { password_hash: 0, createdAt: 0, updatedAt: 0 },
      );

      return response.status(200).json({ users });
    } catch (err) {
      const messageError = err.message;

      return response.status(400).json({ error: messageError });
    }
  }

  async show(request, response) {
    try {
      const { email } = request.params;

      const showUserByEmail = new ShowUserByEmail();
      const user = await showUserByEmail.execute({ email });
      if (!user) {
        return response.status(404).json({ error: 'Usuário não encontrado' });
      }

      return response.status(200).json(user);
    } catch (err) {
      const messageError = err.message;

      return response.status(400).json({ error: messageError });
    }
  }

  async update(request, response) {
    try {
      const { name, email } = request.body;

      const { _id } = request.user._id;

      const updateUserService = new UpdateUserService();

      const userUpdate = await updateUserService.execute({
        _id,
        name,
        email,
      });

      return response.status(200).json(userUpdate);
    } catch (err) {
      const messageError = err.message;

      return response.status(400).json({ error: messageError });
    }
  }
}

module.exports = new UserController();
