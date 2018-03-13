import React from 'react'
import PropTypes from 'prop-types'
import {
  AsyncStorage,
  View,
} from 'react-native'


export default class Experiment extends React.Component {
  constructor(props) {
    super(props)
    this.key = `react-native-ab:Experiment:${props.name}`
    this.variants = props.children
    this.state = {
      variant: <View />,
    }
  }

  componentWillMount() {
    AsyncStorage.getItem(this.key, ((err, variantName) => {
      let variant
      if (err || !variantName) {
        variant = this.props.choose(this.variants)
        AsyncStorage.setItem(this.key, variant.props.name)
      } else {
        variant = this.getVariant(variantName)
      }
      this.props.onChoice(this.props.name, variant.props.name)
      this.props.onRawChoice(this, variant)
      this.setState({ variant })
    }))
  }

  getActiveVariant = () => this.state.variant

  getName = () => this.props.name

  getVariant = name => this.variants.find(v => v.props.name === name)

  reset = (cb) => {
    AsyncStorage.removeItem(this.key, cb)
  }

  render() {
    return this.state.variant
  }
}

Experiment.defaultProps = {
  choose(variants) {
    const choice = Math.floor(Math.random() * variants.length)
    return variants[choice]
  },
  onChoice(testName, variantName) { /* noop */ },
  onRawChoice(test, variant) { /* noop */ },
}

Experiment.propTypes = {
  name: PropTypes.string.isRequired,
  children: ((props, propName) => {
    const children = props[propName]
    if (!Array.isArray(children) || children.length < 2) {
      return new Error('You must have at least 2 Variants.')
    }
    if (children.some(child => !child.type.isVariant)) {
      return new Error('One or more children is not a Variant.')
    }
  }),
  choose: PropTypes.func,
  onChoice: PropTypes.func,
  onRawChoice: PropTypes.func,
}