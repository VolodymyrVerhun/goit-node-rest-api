import mongoose from "mongoose";
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
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }
  contactsService
    .getContactById(id)
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
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }
  contactsService
    .removeContact(id)
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
    favorite: req.body.favorite,
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
    .addContact(value.name, value.email, value.phone, value.favorite)
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
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }
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

export const updateStatusContact = (req, res) => {
  const updateStatus = req.body;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  if (Object.keys(updateStatus).length === 0) {
    return res
      .status(400)
      .json({ message: "Body must have at least one field" });
  }

  const { error } = schema.updateContactStatusSchema.validate(updateStatus, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: error.details.map((detail) => detail.message).join(", "),
    });
  }
  contactsService
    .updateStatusContact(id, updateStatus)
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
