import { each, warn, isObject, isString, isUndefined} from './util';

export default function (types) {

    var Field = {

        name: 'field',

        props: ['config', 'values', 'class'],

        template: '<partial :class="class" :name="type"></partial>',

        data() {
            return Object.assign({
                key: '',
                name: '',
                type: 'text',
                label: '',
                attrs: {},
                options: [],
                default: undefined
            }, this.config);
        },

        created() {
            this.$set('key', `["${this.name.replace(/\./g, '"]["')}"]`);

            if (isUndefined(this.value) && !isUndefined(this.default)) {
                this.value = this.default;
            }
        },

        computed: {

            value: {

                get() {
                    return this.$get(`values${this.key}`);
                },

                set(value) {
                    this.$set(`values${this.key}`, value);
                }

            }

        },

        methods: {

            filterOptions(options) {

                var opts = [];

                if (!options) {
                    warn(`Invalid options provided for ${this.name}`);
                    return opts;
                }

                each(options, (value, name) => {
                    if (isObject(value)) {
                        opts.push({label: name, options: this.filterOptions(value)});
                    } else {
                        opts.push({text: name, value: value});
                    }
                });

                return opts;
            }

        },

        filters: {

            options(options) {
                return this.filterOptions(options);
            }

        },

        partials: {},

        components: {}

    };

    each(types, (type, name) => {
        if (isString(type)) {
            Field.partials[name] = type;
        } else if (isObject(type)) {
            Field.partials[name] = '<component :is="type" :config="config" :value.sync="value"></component>';
            Field.components[name] = (resolve) => {
                resolve(type);
            };
        }
    });

    return Field;
}
