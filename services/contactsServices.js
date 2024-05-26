import Contact from "../models/contact.js";

async function listContacts(ownerId, filter) {
  const query = { owner: ownerId };
  if (filter && filter.favorite !== undefined) {
    query.favorite = filter.favorite;
  }
  return await Contact.find(query);
}

async function getContactById(contactId, ownerId) {
  return await Contact.findOne({ _id: contactId, owner: ownerId });
}

async function removeContact(contactId) {
  return await Contact.findByIdAndDelete(contactId);
}

async function addContact(name, email, phone, favorite, owner) {
  const newContact = new Contact({ name, email, phone, favorite, owner });
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
