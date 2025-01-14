const { isPlainObject } = require('is-plain-object')
const jsYaml = require('js-yaml')
const path = require('path')

const CAMEL_CASE_REGEXP = /(?:^|[^a-z0-9]+)([a-z0-9])|[^a-z0-9]+$/g
const MULTI_DOCUMENT_YAML = /^-{3}[ \t]*?($|[#!]|[|>][ \t]*?$)/m

const TYPE_NAME = "Yaml"


function camelCase (string) {
  return string.toLowerCase().replace(CAMEL_CASE_REGEXP, (_, char) => {
    return char !== undefined ? char.toUpperCase() : ''
  })
}

function loadYaml (content, schema) {
  content += '\n'
  return content.search(MULTI_DOCUMENT_YAML) !== -1
    ? jsYaml.loadAll(content, { schema })
    : jsYaml.load(content, { schema })
}

exports.onCreateNode = async (...args) => {
  const { node } = args[0]

  if (node.internal.mediaType !== 'text/yaml') {
    return
  }

  const {
    actions: { createNode, createParentChildLink },
    createContentDigest,
    createNodeId,
    loadNodeContent
  } = args[0]

  const {
    plugins
  } = args[1]

  function getSchema () {
    const types = []

    for (const { resolve, options } of plugins) {
      const plugin = require(resolve)
      const result = plugin(...args, options)
      const results = Array.isArray(result) ? result : [result]

      // The plugin must return a single type or an array of types
      for (const { options, tag } of results) {
        types.push(new jsYaml.Type(tag, options))
      }
    }

    return types.length
      ? jsYaml.DEFAULT_SCHEMA.extend(types)
      : jsYaml.DEFAULT_SCHEMA
  }

  async function linkNodes (content, { type = '', index = 0 }) {
    if ('id' in content) {
      content.yamlId = content.id
    }

    const child = {
      ...content,
      id: createNodeId(`${node.id}:${index} >>> YAML`),
      children: [],
      parent: node.id,
      internal: {
        contentDigest: createContentDigest(content),
        type: TYPE_NAME
      }
    }

    await createNode(child)
    createParentChildLink({ parent: node, child })

    content.tag.forEach((obj, i) => {
      const tag_child = {
        ...content,
        tagx: obj,
        id: createNodeId(`${node.id}:${index}:${i} >>> YAML`),
        children: [],
        parent: node.id,
        internal: {
          contentDigest: createContentDigest(content),
          type: "Tag"
        }
      }
  
      createNode(tag_child)
      createParentChildLink({ parent: node, child: tag_child })
    });
  }

  async function resolveContent (content) {
    content = await content

    if (Array.isArray(content)) {
      for (let index = 0; index < content.length; index++) {
        content[index] = await resolveContent(content[index])
      }
    } else if (
      isPlainObject(content) &&
      !(content.internal && content.internal.type)
    ) {
      for (const [key, value] of Object.entries(content)) {
        content[key] = await resolveContent(value)
      }
    }

    return content
  }

  const nodeContent = await loadNodeContent(node)
  const yaml = loadYaml(nodeContent, getSchema())

  if (Array.isArray(yaml)) {
    for (const [index, content] of yaml.entries()) {
      if (isPlainObject(content)) {
        const type = `${node.relativeDirectory} ${node.name}`
        const resolvedContent = await resolveContent(content)

        await linkNodes(resolvedContent, { type, index })
      }
    }
  } else if (isPlainObject(yaml)) {
    const type = path.basename(node.dir)
    const resolvedContent = await resolveContent(yaml)

    await linkNodes(resolvedContent, { type })
  }
}

exports.onPluginInit = async (...args) => {
  const { plugins } = args[1]

  for (const { resolve } of plugins) {
    try {
      const { onPluginInit } = require(`${resolve}/gatsby-node.js`)

      if (onPluginInit) {
        await onPluginInit(...args)
      }
    } catch (error) {
      if (error.code !== 'MODULE_NOT_FOUND') {
        throw error
      }
    }
  }
}
