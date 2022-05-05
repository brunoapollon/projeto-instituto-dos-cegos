const MemberFamily = require('@models/MemberFamily');
const Assisted = require('@models/AssistedUser');

const ReturnByTypeVariableAndEdit = require('@service/ReturnAllMemberFamilyByTypeService');
const ReturnByTypeVariable = require('@service/ReturnMemberFamilyByTypeService');

class MemberFamilyController {
  async store(req, res) {
    const { cpf_assisted } = req.body;

    const memberFamily = new MemberFamily(req.body);

    const assistedUser = await Assisted.findOne({ cpf: cpf_assisted });

    if (memberFamily.isResponsible === true) {
      if (!assistedUser) {
        return res.status(400).json({
          message: 'User not found, try again with another CPF',
        });
      }

      if (
        assistedUser.id_Responsible !== undefined &&
        assistedUser.id_Responsible !== null
      ) {
        return res.status(401).json('This Assisted already has a Responsible');
      }

      assistedUser.id_Responsible = memberFamily._id;
      memberFamily.idAssisted.push(assistedUser._id);
      assistedUser.save();
    }

    if (memberFamily.idAssisted.length === 0) {
      memberFamily.idAssisted.push(assistedUser._id);
    }

    try {
      await memberFamily.save();
    } catch (error) {
      return res.status(400).json({ message: error });
    }

    return res.status(201).json(memberFamily);
  }

  async index(req, res) {
    const { idAssisted } = req.params;
    const members = await MemberFamily.find({
      idAssisted,
    }).populate('idAssisted', 'fullName');

    if (members.length === 0) {
      return res.status(400).json({
        message: "This user don't have members of family in the system",
      });
    }
    return res.status(200).json({ members });
  }

  async show(req, res) {
    const { id } = req.params;
    const { type } = req.query;

    const member = await ReturnByTypeVariable.exec(type, id);

    if (member === undefined || member === null) {
      return res.status(400).json({ message: 'Member of Family not found' });
    }
    return res.status(202).json({ member });
  }

  async update(req, res) {
    const { id } = req.params;
    const { type } = req.query;

    const isResponsibleBody = req.body.isResponsible;

    const member = await ReturnByTypeVariableAndEdit.exec(type, id);

    const { CPFAssisted } = req.body;

    const assistedUser = await Assisted.findOne({ cpf: CPFAssisted });

    if (member.isResponsible === true && isResponsibleBody === false) {
      assistedUser.id_Responsible = null;
      delete assistedUser.id_Responsible;
      assistedUser.save();
    }

    if (member.isResponsible === false && isResponsibleBody === true) {
      if (!member.idAssisted.includes(assistedUser.id)) {
        return res.status(401).json({
          message: 'This Assisted and Member are not parents',
        });
      }

      if (assistedUser.id_Responsible === undefined) {
        assistedUser.set('id_Responsible', member._id);
      } else if (assistedUser.id_Responsible === null) {
        assistedUser.set('id_Responsible', member._id);
      } else {
        return res
          .status(401)
          .json({ message: 'this user alredy has a Responsible' });
      }
      try {
        await assistedUser.save();
      } catch (error) {
        return res.status(400).json({ message: error });
      }
    }
    try {
      member.set(req.body);

      await member.save();
      return res.status(204).json({ member_updated: member });
    } catch (error) {
      return res.status(400).json({ message: error });
    }
  }

  async destroy(req, res) {
    const { id } = req.params;
    const { type } = req.query;
    try {
      const member = await ReturnByTypeVariableAndEdit.exec(type, id);

      if (member.isResponsible) {
        member.idAssisted.map(async assisted => {
          const element = await Assisted.findById({ _id: assisted });
          element.id_Responsible = null;
          delete element.id_Responsible;
          element.save();
          return element;
        });
      }

      member.remove();
      return res.status(204).json({ message: 'Member deleted!' });
    } catch (err) {
      return res.status(401).json({ message: `Member not deleted! ${err}` });
    }
  }
}

module.exports = new MemberFamilyController();
