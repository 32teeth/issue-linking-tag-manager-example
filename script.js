/**
 * Custom HTML element representing a Tag manager for issue linking.
 *
 * Handles creation, assignment, and management of tags with types such as 'blocked', 'duplicate', etc.
 * Provides UI for selecting tags and types, and manages their state and interactions.
 *
 * Attributes Observed:
 * - data-tags: JSON string array of available tag IDs.
 * - data-assigned: JSON string array of assigned tag IDs.
 * - data-id: Current tag ID being edited.
 * - data-name: Current tag name being edited.
 * - data-type: Current tag type being edited.
 * - data-target: CSS selector for the target container to which tags are added.
 *
 * Properties:
 * @property {boolean} DEBUG - Enables debug UI if true.
 * @property {Object} Types - Enum of possible tag types.
 * @property {Array<string>} tags - List of available tag IDs.
 * @property {Array<string>} added - List of tag IDs added in this session.
 * @property {Array<string>} assigned - List of tag IDs currently assigned.
 * @property {Object} tag - Current tag object being edited ({ id, name, type, description }).
 * @property {string} id - Current tag ID.
 * @property {string} name - Current tag name.
 * @property {string} type - Current tag type.
 * @property {string} target - CSS selector for the target container.
 *
 * Methods:
 * @method bindEvents - Binds UI events for tag and type inputs and action buttons.
 * @method debugger - Renders debug information if DEBUG is enabled.
 * @method createTypeList - Creates the type selection input and datalist.
 * @method createTagList - Creates the tag selection input and datalist.
 * @method getTagDisplayName - Returns a display name for a given tag ID.
 * @method updateTagList - Updates the tag datalist with current tags.
 * @method createActions - Creates confirm and cancel action buttons.
 * @method connectedCallback - Lifecycle method, initializes UI and events.
 * @method addTooltip - Creates a tooltip element for a tag.
 * @method unCheckTheCheckBox - Unchecks the tag creation checkbox.
 * @method addTagToTarget - Adds a tag element to the target container.
 * @method removeTagFromTarget - Removes a tag element from the target container.
 * @method disconnectedCallback - Lifecycle method, called when element is removed.
 * @method attributeChangedCallback - Handles changes to observed attributes.
 *
 * @extends HTMLElement
 */
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
    const tagInput = this.querySelector('input[list="tags"]');
    const typeInput = this.querySelector('input[list="types"]');

    ['keydown', 'keyup', 'change', 'input'].forEach((event) => {
      tagInput.addEventListener(event, (e) => {
        this.tag.id = e.target.value;
        this.tag.name = e.target.value.replace('#', '');
        this.setAttribute('data-id', this.tag.id);
        this.setAttribute('data-name', this.tag.name);
      });
      typeInput.addEventListener(event, (e) => {
        this.tag.type = e.target.value;
        this.setAttribute('data-type', this.tag.type);
      });
    });

    ['click', 'focus'].forEach((event) => {
      tagInput.addEventListener(event, () => {
        tagInput.setAttribute('placeholder', this.tag.id === '' ? 'issue #' : this.tag.id);
        tagInput.value = '';
      });
      typeInput.addEventListener(event, () => {
        typeInput.setAttribute('placeholder', this.tag.type === this.Types.UNDEFINED ? 'mark as' : this.tag.type);
        typeInput.value = '';
      });
    });

    this.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', (e) => {
        switch (e.target.dataset.action) {
          case 'confirm':
            this.addTagToTarget(this.tag);
            this.tags = this.tags.filter((tag) => tag !== this.tag.id);
            this.added.push(this.tag.id);
            this.setAttribute('data-tags', JSON.stringify(this.tags));
            // fallthrough intended
          case 'cancel':
            this.unCheckTheCheckBox();
            break;
        }
        this.tag = {
          id: '',
          name: '',
          type: this.Types.UNDEFINED
        };
        this.removeAttribute('data-id');
        this.removeAttribute('data-name');
        this.removeAttribute('data-type');
        tagInput.value = '';
        typeInput.value = '';
      });
    });
  }

  debugger() {
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

  createTypeList() {
    const type = document.createElement('input');
    type.type = 'text';
    type.placeholder = 'mark as';
    type.setAttribute('list', 'types');
    type.setAttribute('onchange', 'this.blur()');

    const typelist = document.createElement('datalist');
    typelist.id = 'types';
    [
      'unassigned',
      'blocked',
      'duplicate',
      'related',
      'depends',
      'required'
    ].forEach((val) => {
      const option = document.createElement('option');
      option.value = val;
      typelist.appendChild(option);
    });
    type.appendChild(typelist);

    return type;
  }

  createTagList() {
    const tag = document.createElement('input');
    tag.type = 'text';
    tag.placeholder = 'issue #';
    tag.setAttribute('list', 'tags');
    tag.setAttribute('onchange', 'this.blur()');

    const taglist = document.createElement('datalist');
    taglist.id = 'tags';
    tag.appendChild(taglist);

    return tag;
  }

  getTagDisplayName(tagId) {
    return generateRandomDescription();
  }

  updateTagList() {
    const taglist = this.querySelector('datalist[id="tags"]');
    if (!taglist) return;
    taglist.innerHTML = '';
    this.tags.forEach((tag) => {
      const option = document.createElement('option');
      option.value = tag;
      option.textContent = this.getTagDisplayName(tag);
      taglist.appendChild(option);
    });
  }

  createActions() {
    const actions = document.createElement('ui-tag-actions');
    const confirm = document.createElement('button');
    confirm.type = 'button';
    confirm.dataset.action = 'confirm';

    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.dataset.action = 'cancel';

    actions.appendChild(confirm);
    actions.appendChild(cancel);

    return actions;
  }

  connectedCallback() {
    const type = this.createTypeList();
    const tag = this.createTagList();
    const actions = this.createActions();

    this.appendChild(tag);
    this.appendChild(type);
    this.appendChild(actions);

    if (this.DEBUG) {
      const debug = document.createElement('ui-tag-debugger');
      this.appendChild(debug);
    }

    this.bindEvents();
  }

  addTooltip(name) {
    const tooltip = document.createElement('tooltip');
    const markdown = document.createElement('github-md');
    markdown.innerHTML = `
### ${name} - ${generateRandomDescription()}

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

  unCheckTheCheckBox() {
    const checkbox = document.querySelector(`input#create-tag[type="checkbox"]`);
    if (checkbox) checkbox.checked = false;
  }

  addTagToTarget({ id, name, type }) {
    const tags = document.querySelector(this.target);
    if (!tags) return;
    const tag = document.createElement('tag');
    tag.setAttribute('data-id', id);
    tag.setAttribute('data-name', name);
    tag.setAttribute('data-type', type);

    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.action = 'remove';
    button.addEventListener('click', () => {
      this.removeTagFromTarget({ id, name, type });
    });

    tag.innerHTML = `${id}`;
    tag.appendChild(button);
    tag.appendChild(this.addTooltip(name));
    tags.prepend(tag);
    if (typeof renderMarkdown === 'function') renderMarkdown();

    this.tags = this.tags.filter((t) => t !== id);
    this.setAttribute('data-tags', JSON.stringify(this.tags));
    this.updateTagList();

    const tagInput = this.querySelector('input[list="tags"]');
    const typeInput = this.querySelector('input[list="types"]');
    if (tagInput) {
      tagInput.value = '';
      tagInput.placeholder = 'issue #';
    }
    if (typeInput) {
      typeInput.value = '';
      typeInput.placeholder = 'mark as';
    }

    this.unCheckTheCheckBox();
  }

  removeTagFromTarget({ id }) {
    const tags = document.querySelector(this.target);
    if (!tags) return;
    const tag = tags.querySelector(`tag[data-id="${id}"]`);
    if (tag) tags.removeChild(tag);
    this.added = this.added.filter((tag) => tag !== id);

    if (!this.tags.includes(id)) {
      this.tags.push(id);
      this.tags.sort((a, b) => {
        const numA = parseInt(a.replace('#', ''), 10);
        const numB = parseInt(b.replace('#', ''), 10);
        return numA - numB;
      });
    }
    this.setAttribute('data-tags', JSON.stringify(this.tags));
    this.updateTagList();
  }

  disconnectedCallback() {}

  attributeChangedCallback(name, prev, current) {
    this[name.replace('data-', '')] = current;
    if (name === 'data-tags') {
      this.tags = JSON.parse(current);
      this.updateTagList();
    }

    if (name === 'data-assigned') {
      this.assigned = JSON.parse(current);
      for (const tag of this.assigned) {
        const type = Object.values(this.Types)[Math.floor(Math.random() * Object.values(this.Types).length)];
        this.addTagToTarget({ id: tag, name: tag, type });
        this.tags = this.tags.filter((t) => t !== tag);
      }
    }

    this.querySelectorAll('button').forEach((button) => {
      if (this.tag.id !== '' && this.tag.type !== this.Types.UNDEFINED) {
        button.removeAttribute('disabled');
      } else {
        button.setAttribute('disabled', 'disabled');
      }
      if (button.dataset.action === 'cancel') {
        button.removeAttribute('disabled');
      }
    });

    if (this.DEBUG) {
      this.debugger();
    }
  }
}

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
