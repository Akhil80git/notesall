// =======================
// 🌐 SERVER.JS — FULL WORKING CODE
// =======================

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// =======================
// ⚙️ MIDDLEWARE
// =======================
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// =======================
// 🧩 MONGODB CONNECTION
// =======================
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err));

// =======================
// 🧱 SCHEMAS & MODELS
// =======================

// Folder schema
const folderSchema = new mongoose.Schema({
  name: String,
  createdAt: { type: Date, default: Date.now }
});

// File schema
const fileSchema = new mongoose.Schema({
  folderId: String,
  name: String,
  content: String,
  createdAt: { type: Date, default: Date.now }
});

// Note schema
const noteSchema = new mongoose.Schema({
  fileId: String,
  title: String,
  content: String,
  createdAt: { type: Date, default: Date.now }
});

// Models
const Folder = mongoose.model('Folder', folderSchema);
const File = mongoose.model('File', fileSchema);
const Note = mongoose.model('Note', noteSchema);

// =======================
// 📁 FOLDER APIs
// =======================

// 1️⃣ Get all folders
app.get('/api/folders', async (req, res) => {
  const folders = await Folder.find();
  res.json(folders);
});

// 2️⃣ Create new folder
app.post('/api/folders', async (req, res) => {
  const folder = new Folder({ name: req.body.name });
  await folder.save();
  res.json(folder);
});

// 3️⃣ Update folder name
app.put('/api/folders/:id', async (req, res) => {
  const updated = await Folder.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true }
  );
  res.json(updated);
});

// 4️⃣ Delete folder (and all its files + notes)
app.delete('/api/folders/:id', async (req, res) => {
  const files = await File.find({ folderId: req.params.id });
  for (const f of files) {
    await Note.deleteMany({ fileId: f._id });
  }
  await File.deleteMany({ folderId: req.params.id });
  await Folder.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// =======================
// 📄 FILE APIs
// =======================

// 5️⃣ Get all files inside a folder
app.get('/api/files/:folderId', async (req, res) => {
  const files = await File.find({ folderId: req.params.folderId });
  res.json(files);
});

// 6️⃣ Create new file
app.post('/api/files', async (req, res) => {
  const file = new File({
    folderId: req.body.folderId,
    name: req.body.name,
    content: ""
  });
  await file.save();
  res.json(file);
});

// 7️⃣ Update file (name/content)
app.put('/api/files/:id', async (req, res) => {
  const file = await File.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name, content: req.body.content },
    { new: true }
  );
  res.json(file);
});

// 8️⃣ Delete file (and its notes)
app.delete('/api/files/:id', async (req, res) => {
  await Note.deleteMany({ fileId: req.params.id });
  await File.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// =======================
// 🗒️ NOTE APIs
// =======================

// 9️⃣ Get all notes inside a file
app.get('/api/notes/:fileId', async (req, res) => {
  const notes = await Note.find({ fileId: req.params.fileId });
  res.json(notes);
});

// 🔟 Add new note
app.post('/api/notes', async (req, res) => {
  const note = new Note({
    fileId: req.body.fileId,
    title: req.body.title,
    content: req.body.content || ""
  });
  await note.save();
  res.json(note);
});

// 11️⃣ Update note
app.put('/api/notes/:id', async (req, res) => {
  const note = await Note.findByIdAndUpdate(
    req.params.id,
    { title: req.body.title, content: req.body.content },
    { new: true }
  );
  res.json(note);
});

// 12️⃣ Delete note
app.delete('/api/notes/:id', async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// =======================
// 🚀 START SERVER
// =======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

