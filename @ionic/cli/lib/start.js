"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STARTER_TEMPLATES = exports.SUPPORTED_FRAMEWORKS = exports.getStarterProjectTypes = exports.getStarterList = exports.getAdvertisement = exports.readStarterManifest = exports.verifyOptions = exports.STARTER_BASE_URL = void 0;
const utils_fs_1 = require("@ionic/utils-fs");
const utils_terminal_1 = require("@ionic/utils-terminal");
const lodash = require("lodash");
const constants_1 = require("../constants");
const guards_1 = require("../guards");
const color_1 = require("./color");
const errors_1 = require("./errors");
const project_1 = require("./project");
const emoji_1 = require("./utils/emoji");
const http_1 = require("./utils/http");
exports.STARTER_BASE_URL = 'https://d2ql0qc7j8u4b2.cloudfront.net';
function verifyOptions(options, { log }) {
    // If the action is list then lets just end here.
    if (options['list']) {
        const typeOption = options['type'] ? String(options['type']) : undefined;
        if (typeOption && !constants_1.PROJECT_TYPES.includes(typeOption)) {
            throw new errors_1.FatalException(`${color_1.input(typeOption)} is not a valid project type.\n` +
                `Valid project types are: ${getStarterProjectTypes().map(type => color_1.input(type)).join(', ')}`);
        }
        const headers = ['name', 'description'].map(h => color_1.strong(h));
        const starterTypes = typeOption ? [typeOption] : getStarterProjectTypes();
        for (const starterType of starterTypes) {
            const starters = exports.STARTER_TEMPLATES.filter(template => template.projectType === starterType);
            log.rawmsg(`\n${color_1.strong(`Starters for ${project_1.prettyProjectName(starterType)}`)} (${color_1.input(`--type=${starterType}`)})\n\n`);
            log.rawmsg(utils_terminal_1.columnar(starters.map(({ name, description }) => [color_1.input(name), description || '']), { ...constants_1.COLUMNAR_OPTIONS, headers }));
            log.rawmsg('\n');
        }
        throw new errors_1.FatalException('', 0);
    }
    if (options['skip-deps']) {
        log.warn(`The ${color_1.input('--skip-deps')} option has been deprecated. Please use ${color_1.input('--no-deps')}.`);
        options['deps'] = false;
    }
    if (options['skip-link']) {
        log.warn(`The ${color_1.input('--skip-link')} option has been deprecated. Please use ${color_1.input('--no-link')}.`);
        options['link'] = false;
    }
    if (options['pro-id']) {
        log.warn(`The ${color_1.input('--pro-id')} option has been deprecated. Please use ${color_1.input('--id')}.`);
        options['id'] = options['pro-id'];
    }
    if (options['id']) {
        if (options['link'] === false) {
            log.warn(`The ${color_1.input('--no-link')} option has no effect with ${color_1.input('--id')}. App must be linked.`);
        }
        options['link'] = true;
        if (!options['git']) {
            log.warn(`The ${color_1.input('--no-git')} option has no effect with ${color_1.input('--id')}. Git must be used.`);
        }
        options['git'] = true;
    }
}
exports.verifyOptions = verifyOptions;
async function readStarterManifest(p) {
    try {
        const manifest = await utils_fs_1.readJson(p);
        if (!guards_1.isStarterManifest(manifest)) {
            throw new Error(`${p} is not a valid starter manifest.`);
        }
        return manifest;
    }
    catch (e) {
        if (e.code === 'ENOENT') {
            throw new Error(`${p} not found`);
        }
        else if (e instanceof SyntaxError) {
            throw new Error(`${p} is not valid JSON.`);
        }
        throw e;
    }
}
exports.readStarterManifest = readStarterManifest;
function getAdvertisement() {
    const choices = [getAppflowAdvertisement, getAdvisoryAdvertisement, getEnterpriseAdvertisement];
    const idx = Math.floor(Math.random() * choices.length);
    return `${choices[idx]()}\n\n`;
}
exports.getAdvertisement = getAdvertisement;
function getAppflowAdvertisement() {
    return `
  ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????

        ${color_1.title('Ionic Appflow')}, the mobile DevOps solution by Ionic

           Continuously build, deploy, and ship apps ${emoji_1.emoji('????', '')}
        Focus on building apps while we automate the rest ${emoji_1.emoji('????', '')}

        ${emoji_1.emoji('         ???? ', 'Learn more:')} ${color_1.strong('https://ion.link/appflow')} ${emoji_1.emoji(' ????', '')}

  ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
`;
}
function getAdvisoryAdvertisement() {
    return `
  ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????

         ${color_1.title('Ionic Advisory')}, tailored solutions and expert services by Ionic

                             Go to market faster ${emoji_1.emoji('????', '')}
                    Real-time troubleshooting and guidance ${emoji_1.emoji('????', '')}
        Custom training, best practices, code and architecture reviews ${emoji_1.emoji('????', '')}
      Customized strategies for every phase of the development lifecycle ${emoji_1.emoji('????', '')}

               ${emoji_1.emoji('         ???? ', 'Learn more:')} ${color_1.strong('https://ion.link/advisory')} ${emoji_1.emoji(' ????', '')}

  ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
`;
}
function getEnterpriseAdvertisement() {
    return `
  ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????

      ${color_1.title('Ionic Enterprise')}, platform and solutions for teams by Ionic

                  Powerful library of native APIs ${emoji_1.emoji('??????', '')}
                 A supercharged platform for teams ${emoji_1.emoji('????', '')}

         ${emoji_1.emoji('         ???? ', 'Learn more:')} ${color_1.strong('https://ion.link/enterprise')} ${emoji_1.emoji(' ????', '')}

  ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
`;
}
async function getStarterList(config, tag = 'latest') {
    const { req } = await http_1.createRequest('GET', `${exports.STARTER_BASE_URL}/${tag === 'latest' ? '' : `${tag}/`}starters.json`, config.getHTTPConfig());
    const res = await req;
    // TODO: typecheck
    return res.body;
}
exports.getStarterList = getStarterList;
function getStarterProjectTypes() {
    return lodash.uniq(exports.STARTER_TEMPLATES.map(t => t.projectType));
}
exports.getStarterProjectTypes = getStarterProjectTypes;
exports.SUPPORTED_FRAMEWORKS = [
    {
        name: 'Angular',
        type: 'angular',
        description: 'https://angular.io',
    },
    {
        name: 'React',
        type: 'react',
        description: 'https://reactjs.org',
    },
    {
        name: 'Vue',
        type: 'vue',
        description: 'https://vuejs.org',
    },
];
exports.STARTER_TEMPLATES = [
    {
        name: 'tabs',
        projectType: 'vue',
        type: 'managed',
        description: 'A starting project with a simple tabbed interface',
        id: 'vue-official-tabs',
    },
    {
        name: 'sidemenu',
        projectType: 'vue',
        type: 'managed',
        description: 'A starting project with a side menu with navigation in the content area',
        id: 'vue-official-sidemenu',
    },
    {
        name: 'blank',
        projectType: 'vue',
        type: 'managed',
        description: 'A blank starter project',
        id: 'vue-official-blank',
    },
    {
        name: 'list',
        projectType: 'vue',
        type: 'managed',
        description: 'A starting project with a list',
        id: 'vue-official-list',
    },
    {
        name: 'tabs',
        projectType: 'angular',
        type: 'managed',
        description: 'A starting project with a simple tabbed interface',
        id: 'angular-official-tabs',
    },
    {
        name: 'sidemenu',
        projectType: 'angular',
        type: 'managed',
        description: 'A starting project with a side menu with navigation in the content area',
        id: 'angular-official-sidemenu',
    },
    {
        name: 'blank',
        projectType: 'angular',
        type: 'managed',
        description: 'A blank starter project',
        id: 'angular-official-blank',
    },
    {
        name: 'list',
        projectType: 'angular',
        type: 'managed',
        description: 'A starting project with a list',
        id: 'angular-official-list',
    },
    {
        name: 'my-first-app',
        projectType: 'angular',
        type: 'repo',
        description: 'An example application that builds a camera with gallery',
        repo: 'https://github.com/ionic-team/photo-gallery-capacitor-ng',
    },
    {
        name: 'conference',
        projectType: 'angular',
        type: 'repo',
        description: 'A kitchen-sink application that shows off all Ionic has to offer',
        repo: 'https://github.com/ionic-team/ionic-conference-app',
    },
    {
        name: 'blank',
        projectType: 'react',
        type: 'managed',
        description: 'A blank starter project',
        id: 'react-official-blank',
    },
    {
        name: 'list',
        projectType: 'react',
        type: 'managed',
        description: 'A starting project with a list',
        id: 'react-official-list',
    },
    {
        name: 'my-first-app',
        projectType: 'react',
        type: 'repo',
        description: 'An example application that builds a camera with gallery',
        repo: 'https://github.com/ionic-team/photo-gallery-capacitor-react',
    },
    {
        name: 'sidemenu',
        projectType: 'react',
        type: 'managed',
        description: 'A starting project with a side menu with navigation in the content area',
        id: 'react-official-sidemenu',
    },
    {
        name: 'tabs',
        projectType: 'react',
        type: 'managed',
        description: 'A starting project with a simple tabbed interface',
        id: 'react-official-tabs',
    },
    {
        name: 'conference',
        projectType: 'react',
        type: 'repo',
        description: 'A kitchen-sink application that shows off all Ionic has to offer',
        repo: 'https://github.com/ionic-team/ionic-react-conference-app',
    },
    {
        name: 'tabs',
        projectType: 'ionic-angular',
        type: 'managed',
        description: 'A starting project with a simple tabbed interface',
        id: 'ionic-angular-official-tabs',
    },
    {
        name: 'sidemenu',
        projectType: 'ionic-angular',
        type: 'managed',
        description: 'A starting project with a side menu with navigation in the content area',
        id: 'ionic-angular-official-sidemenu',
    },
    {
        name: 'blank',
        projectType: 'ionic-angular',
        type: 'managed',
        description: 'A blank starter project',
        id: 'ionic-angular-official-blank',
    },
    {
        name: 'super',
        projectType: 'ionic-angular',
        type: 'managed',
        description: 'A starting project complete with pre-built pages, providers and best practices for Ionic development.',
        id: 'ionic-angular-official-super',
    },
    {
        name: 'tutorial',
        projectType: 'ionic-angular',
        type: 'managed',
        description: 'A tutorial based project that goes along with the Ionic documentation',
        id: 'ionic-angular-official-tutorial',
    },
    {
        name: 'aws',
        projectType: 'ionic-angular',
        type: 'managed',
        description: 'AWS Mobile Hub Starter',
        id: 'ionic-angular-official-aws',
    },
    {
        name: 'tabs',
        projectType: 'ionic1',
        type: 'managed',
        description: 'A starting project for Ionic using a simple tabbed interface',
        id: 'ionic1-official-tabs',
    },
    {
        name: 'sidemenu',
        projectType: 'ionic1',
        type: 'managed',
        description: 'A starting project for Ionic using a side menu with navigation in the content area',
        id: 'ionic1-official-sidemenu',
    },
    {
        name: 'blank',
        projectType: 'ionic1',
        type: 'managed',
        description: 'A blank starter project for Ionic',
        id: 'ionic1-official-blank',
    },
    {
        name: 'maps',
        projectType: 'ionic1',
        type: 'managed',
        description: 'An Ionic starter project using Google Maps and a side menu',
        id: 'ionic1-official-maps',
    },
];
