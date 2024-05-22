import Contact from "../models/contact.js";

async function listContacts() {
  return await Contact.find();
}

async function getContactById(contactId) {
  return await Contact.findById(contactId);
}

async function removeContact(contactId) {
  return await Contact.findByIdAndDelete(contactId);
}

async function addContact(name, email, phone, favorite) {
  const newContact = new Contact({ name, email, phone, favorite });
  await newContact.save();
  return newContact;
}

async function updateContact(contactId, body) {
  const contact = await Contact.findByIdAndUpdate(contactId, body, {
    new: true,
  });
  return contact;
}

async function updateStatusContact(contactId, status) {
  const contact = await Contact.findByIdAndUpdate(contactId, status, {
    new: true,
  });
  return contact;
}

export default {
  listContacts,
  removeContact,
  getContactById,
  addContact,
  updateContact,
  updateStatusContact,
};
