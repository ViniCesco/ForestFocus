const notesGrid = document.getElementById('notesGrid');
let notes = [];

function loadNotes() {
  const saved = localStorage.getItem('forestFocus_notes');
  
  if (saved) {
    notes = JSON.parse(saved);
  }

  // Verifica se o array está vazio OU se a primeira nota está totalmente em branco
  const isFirstNoteEmpty = notes.length === 1 && !notes[0].title.trim() && !notes[0].content.trim();

  if (!notes || notes.length === 0 || isFirstNoteEmpty) {
    notes = [
      {
        id: Date.now(),
        title: '🌱 Bem-vindo às Anotações',
        content: 'Este é o seu bloco de notas! Clique no lápis para editar o texto ou no botão + para criar novas anotações.',
        date: new Date().toLocaleDateString('pt-BR'),
        isEditing: false
      }
    ];
    saveNotes();
  }

  renderNotes();
}

function saveNotes() {
  localStorage.setItem('forestFocus_notes', JSON.stringify(notes));
}

function renderNotes() {
  notesGrid.innerHTML = '';

  notes.forEach((note, index) => {
    const card = document.createElement('div');
    card.className = `note-card ${note.isEditing ? 'editing' : ''}`;

    card.innerHTML = `
      <input 
        type="text" 
        class="note-title" 
        id="title-${index}"
        placeholder="Título..." 
        value="${note.title || ''}"
        ${!note.isEditing ? 'readonly' : ''}
        oninput="updateNote(${index}, 'title', this.value)"
      >
      <textarea 
        class="note-body" 
        id="body-${index}"
        placeholder="Escreva algo..." 
        ${!note.isEditing ? 'readonly' : ''}
        oninput="updateNote(${index}, 'content', this.value)"
      >${note.content || ''}</textarea>
      <div class="note-footer">
        <span class="note-date">${note.date}</span>
        <div class="note-actions">
          <button class="note-btn" onclick="toggleEdit(${index})" title="${note.isEditing ? 'Concluir' : 'Editar'}">
            ${note.isEditing ? '✅' : '✏️'}
          </button>
          <button class="note-btn delete" onclick="deleteNote(${index})" title="Excluir">🗑️</button>
        </div>
      </div>
    `;

    notesGrid.appendChild(card);
  });
}

function createNote() {
  const newNote = {
    id: Date.now(),
    title: '',
    content: '',
    date: new Date().toLocaleDateString('pt-BR'),
    isEditing: true
  };

  notes.unshift(newNote);
  saveNotes();
  renderNotes();

  setTimeout(() => {
    const firstTitle = document.getElementById('title-0');
    if (firstTitle) firstTitle.focus();
  }, 50);
}

function toggleEdit(index) {
  notes[index].isEditing = !notes[index].isEditing;
  saveNotes();
  renderNotes();

  if (notes[index].isEditing) {
    setTimeout(() => {
      const bodyInput = document.getElementById(`body-${index}`);
      if (bodyInput) bodyInput.focus();
    }, 50);
  }
}

function updateNote(index, field, value) {
  notes[index][field] = value;
  saveNotes();
}

function deleteNote(index) {
  notes.splice(index, 1);
  saveNotes();
  renderNotes();
}

loadNotes();