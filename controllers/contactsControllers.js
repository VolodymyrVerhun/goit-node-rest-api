import contactsService from "../services/contactsServices.js";
import schema from "../schemas/contactsSchemas.js";

export const getAllContacts = (req, res) => {
  contactsService
    .listContacts()
    .then((contacts) => res.status(200).json(contacts))
    .catch((error) => {
      res
        .status(500)
        .json({ message: "An error occurred", error: error.message });
    });
};

export const getOneContact = (req, res) => {
  contactsService
    .getContactById(req.params.id)
    .then((contact) => {
      if (contact) {
        res.status(200).json(contact);
      } else {
        res.status(404).json({ message: "Not found" });
      }
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "An error occurred", error: error.message });
    });
};

export const deleteContact = (req, res) => {
  contactsService
    .removeContact(req.params.id)
    .then((contact) => {
      if (contact) {
        res.status(200).json(contact);
      } else {
        res.status(404).json({ message: "Not found" });
      }
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "An error occurred", error: error.message });
    });
};

export const createContact = (req, res) => {
  const newContact = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
  };
  const { error, value } = schema.createContactSchema.validate(newContact, {
    abortEarly: false,
  });
  if (typeof error !== "undefined") {
    return res.status(400).json({
      message: error.details.map((error) => error.message).join(", "),
    });
  }
  contactsService
    .addContact(value.name, value.email, value.phone)
    .then((contact) => {
      if (contact) {
        res.status(201).json(contact);
      } else {
        res.status(404).json({ message: "Not found" });
      }
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "An error occurred", error: error.message });
    });
};

export const updateContact = (req, res) => {
  const updateContact = req.body;
  const id = req.params.id;

  if (Object.keys(updateContact).length === 0) {
    return res
      .status(400)
      .json({ message: "Body must have at least one field" });
  }
  const { error } = schema.updateContactSchema.validate(updateContact, {
    abortEarly: false,
  });
  if (typeof error !== "undefined") {
    return res.status(400).json({
      message: error.details.map((error) => error.message).join(", "),
    });
  }
  contactsService
    .updateContact(id, updateContact)
    .then((contact) => {
      if (contact) {
        res.status(200).json(contact);
      } else {
        res.status(404).json({ message: "Not found" });
      }
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "An error occurred", error: error.message });
    });
};
