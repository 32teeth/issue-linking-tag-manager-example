class Tag extends HTMLElement {
  constructor() {
    super();

    this.DEBUG = false;

    this.Types = {
      UNDEFINED: 'undefined',
      UNASSIGNED: 'unassigned',
      BLOCKED: 'blocked',
      DUPLICATE: 'duplicate',
      RELATED: 'related',
      DEPENDS: 'depends',
      REQUIRED: 'required'
    };

    this.tags = [];
    this.descirptions = [];
    this.added = [];
    this.assigned = [];


    this.tag = {
      id: '',
      name: '',
      type: this.Types.UNDEFINED,
      description: generateRandomDescription()
    };

    this.id = '';
    this.name = '';
    this.type = this.Types.UNDEFINED;
    this.target = '';
  }

  static get observedAttributes() {
    return ['data-tags', 'data-assigned', 'data-id', 'data-name', 'data-type', 'data-target'];
  }

  bindEvents() {
    const tag = this.querySelector('input[list="tags"]');
    const type = this.querySelector('input[list="types"]');

    ['keydown', 'keyup', 'input'].forEach((event) => {
      tag.addEventListener(event, (event) => {
        console.log(event.target.value)
        this.tag.id = event.target.value;
        this.setAttribute('data-id', this.tag.id);
      });
      type.addEventListener(event, (event) => {
        this.tag.type = event.target.value;
        this.setAttribute('data-type', this.tag.type);
      });
    });

    ['click', 'focus'].forEach((event) => {
      tag.addEventListener(event, (event) => {
        tag.value = ''
      });
      type.addEventListener(event, (event) => {
        type.value = ''
      });
    });
  }

  debugger = () => {
    const debug = this.querySelector('ui-tag-debugger');
    debug.innerHTML = `
<pre>
tags: ${JSON.stringify(this.tags)}
added: ${JSON.stringify(this.added)}
assigned: ${JSON.stringify(this.assigned)}
target: ${this.target}
tag: ${JSON.stringify(this.tag, null, 2)}
</pre>
    `;
  }

  bindEvents() {
    const tag = this.querySelector('input[list="tags"]');
    const type = this.querySelector('input[list="types"]');

    ['keydown', 'keyup', 'change', 'input'].forEach((event) => {
      tag.addEventListener(event, (event) => {
        this.tag.id = event.target.value;
        this.tag.name = event.target.value.replace('#', '');
        this.setAttribute('data-id', this.tag.id);
        this.setAttribute('data-name', this.tag.name);
      });
      type.addEventListener(event, (event) => {
        this.tag.type = event.target.value;
        this.setAttribute('data-type', this.tag.type);
      });
    });
    ['click', 'focus'].forEach((event) => {
      tag.addEventListener(event, (event) => {
        tag.setAttribute('placeholder', this.tag.id === '' ? 'issue #' : this.tag.id)
        tag.value = ''
      });
      type.addEventListener(event, (event) => {
        type.setAttribute('placeholder', this.tag.type === this.Types.UNDEFINED ? 'mark as' : this.tag.type)
        type.value = ''
      });
    });

    this.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', (event) => {
        switch (event.target.dataset.action) {
          case 'confirm':
            this.addTagToTarget(this.tag);
            this.tags = this.tags.filter((tag) => tag !== this.tag.id);
            this.added.push(this.tag.id);
            this.setAttribute('data-tags', JSON.stringify(this.tags));

          case 'cancel':
            break;
        };
        this.tag = {
          id: '',
          name: '',
          type: this.Types.UNDEFINED
        };
        this.removeAttribute('data-id');
        this.removeAttribute('data-name');
        this.removeAttribute('data-type');
        this.querySelector('input[list="tags"]').value = '';
        this.querySelector('input[list="types"]').value = '';

      });
    });
  }

  createTypeList() {
    const type = document.createElement('input');
    type.setAttribute('type', 'text');
    type.setAttribute('placeholder', 'mark as');
    type.setAttribute('list', 'types');
    type.setAttribute('onchange', 'this.blur()');

    const typelist = document.createElement('datalist');
    typelist.setAttribute('id', 'types');
    const types = [
      'unassigned',
      'blocked',
      'duplicate',
      'related',
      'depends',
      'required'
    ];
    Object.keys(types).forEach((type) => {
      const option = document.createElement('option');
      option.setAttribute('value', types[type]);
      typelist.appendChild(option);
    });
    type.appendChild(typelist);

    return type;
  }

  createTagList() {
    const tag = document.createElement('input');
    tag.setAttribute('type', 'text');
    tag.setAttribute('placeholder', 'issue #');
    tag.setAttribute('list', 'tags');
    tag.setAttribute('onchange', 'this.blur()');

    const taglist = document.createElement('datalist');
    taglist.setAttribute('id', 'tags');
    tag.appendChild(taglist);

    return tag;
  }

  updateTagList() {
    const taglist = this.querySelector('datalist[id="tags"]');
    taglist.innerHTML = '';
    this.tags.forEach((tag) => {
      const option = document.createElement('option');
      option.setAttribute('value', tag);
      taglist.appendChild(option);
    });
  }

  ceateActions() {
    const actions = document.createElement('ui-tag-actions');
    const confirm = document.createElement('button');
    confirm.setAttribute('type', 'button');
    confirm.setAttribute('data-action', 'confirm');

    const cancel = document.createElement('button');
    cancel.setAttribute('type', 'button');
    cancel.setAttribute('data-action', 'cancel');

    actions.appendChild(confirm);
    actions.appendChild(cancel);

    return actions;
  }

  connectedCallback() {
    const type = this.createTypeList();
    const tag = this.createTagList();
    const actions = this.ceateActions();

    this.appendChild(tag);
    this.appendChild(type);
    this.appendChild(actions);

    if(this.DEBUG) {
      const debug = document.createElement('ui-tag-debugger');
      this.appendChild(debug);
    };

    this.bindEvents();
  }

  addTooltip(id) {
    const tooltip = document.createElement('tooltip');
    const markdown = document.createElement('github-md');
    markdown.innerHTML = `
### \${name} - ${generateRandomDescription()}

##### Things to do

- [ ] Add a description
- [x] Add a link to the issue
- [ ] Add a link to the project

\`\`\`javascript
const let var static = 'string';
\`\`\`
`;

    tooltip.appendChild(markdown);
    return tooltip;
  }

  addTagToTarget({ id, name, type}) {
    const tags = document.querySelector(this.target);
    const tag = document.createElement('tag');
    tag.setAttribute('data-id', id);
    tag.setAttribute('data-name', name);
    tag.setAttribute('data-type', type);

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.setAttribute('data-action', 'remove');
    button.addEventListener('click', (event) => {
      this.removeTagFromTarget({ id, name, type });
    });

    tag.innerHTML = `${id}`;
    tag.appendChild(button);
    tag.appendChild(this.addTooltip(id));
    tags.prepend(tag);
    renderMarkdown();
  }

  removeTagFromTarget({ id, name, type }) {
    const tags = document.querySelector(this.target);
    const tag = tags.querySelector(`tag[data-id="${id}"]`);
    tags.removeChild(tag);
    this.added = this.added.filter((tag) => tag !== id);
    this.tags.push(id);
    this.setAttribute('data-tags', JSON.stringify(this.tags));
  }


  disconnectedCallback() {}

  attributeChangedCallback(name, prev, current) {
    this[name.replace('data-', '')] = current;
    if(name === 'data-tags') {
      this.tags = JSON.parse(current);
      const taglist = this.querySelector('datalist[id="tags"]');
      taglist.innerHTML = '';
      this.tags.forEach((tag) => {
        const option = document.createElement('option');
        option.setAttribute('value', tag);
        taglist.appendChild(option);
      });

      this.updateTagList();
    }

    if(name === 'data-assigned') {
      this.assigned = JSON.parse(current);
      for(const tag of this.assigned) {
        const type = Object.values(this.Types)[Math.floor(Math.random() * Object.values(this.Types).length)];
        this.addTagToTarget({ id: tag, name: tag, type });
        this.tags = this.tags.filter((t) => t !== tag);
      }
    }

    this.querySelectorAll('button').forEach((button) => {
      this.tag.id !== '' && this.tag.type !== 'undefined' ? button.removeAttribute('disabled') : button.setAttribute('disabled', 'disabled');
    })

    if (this.DEBUG) {
      this.debugger();
    }
  }
}

/**
 *
 */
window.customElements.define('ui-tag', Tag);

const tags = Array.from({ length: Math.floor(Math.random() * 25) + 1 }, () => Math.floor(Math.random() * 1000) + 1)
  .filter((value, index, self) => self.indexOf(value) === index)
  .sort((a, b) => a - b)
  .map((tag) => `#${tag}`);


const assigned = tags.filter(() => Math.random() > 0.8);



const tag = document.querySelector('ui-tag');
tag.setAttribute('data-tags', JSON.stringify(tags));
tag.setAttribute('data-target', 'tags');
tag.setAttribute('data-assigned', JSON.stringify(assigned));
