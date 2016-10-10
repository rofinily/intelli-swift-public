import PureRenderMixin from 'react-addons-pure-render-mixin'
import mixin from 'react-mixin'
import ReactDOM from 'react-dom'

import {cn, sc, requestAnimationFrame, emptyFunction} from 'core'
import React, {
    Component,
    StyleSheet,
    Text,
    Image,
    Dimensions,
    ListView,
    View,
    PixelRatio,
    Fetch,
    TouchableWithoutFeedback
} from 'lib'

import {Colors} from 'data'

import Icon from '../Icon'
import './IconLink.css'


class IconLink extends Component {
    constructor(props, context) {
        super(props, context);
        const {selected} = props;
        this.state = {selected};
    }

    static propTypes = {};

    static defaultProps = {
        className: '',
        iconWidth: 16,
        iconHeight: 16,
        selected: null,
        disabled: false,
        invalid: false,
        stopPropagation: false,
        onSelected: emptyFunction,
        onPress: emptyFunction
    };

    state = {};

    componentWillMount() {

    }

    componentDidMount() {

    }

    componentWillReceiveProps(props) {
        const {text, value, selected} = props;
        this.state = {text, value, selected};
    }

    componentWillUpdate() {

    }

    _onPress(e) {
        if (this.props.disabled === false && this.props.invalid === false && (this.state.selected === false || this.state.selected === true)) {
            this.setState({
                selected: !this.state.selected
            }, ()=> {
                this.props.onSelected(this.state.selected);
            });
        }
        this.props.onPress(e);
        if (this.props.stopPropagation) {
            e.stopPropagation();
        }
    }

    render() {
        const {...props} = this.props, {...state} = this.state;
        if (props.disabled === true) {
            return <View className={cn(props.className, 'react-view')}
                         style={[styles.wrapper, styles.disabled, props.style]}>
                <Icon width={props.iconWidth} height={props.iconHeight}/>
            </View>
        }
        if (props.invalid === true) {
            return <View className={cn(props.className, 'react-view')} style={[styles.wrapper, props.style]}>
                <Icon width={props.iconWidth} height={props.iconHeight}/>
            </View>
        }
        return <TouchableWithoutFeedback style={[props.style]} onPress={this._onPress.bind(this)}>
            <View className={cn(props.className, 'react-view', 'IconLink', cn({
                'active': this.state.selected
            }))} style={[styles.style, styles.wrapper]}>
                <Icon width={props.iconWidth} height={props.iconHeight}/>
            </View>
        </TouchableWithoutFeedback>
    }

}
mixin.onClass(IconLink, PureRenderMixin);
const styles = StyleSheet.create({
    wrapper: {
        justifyContent: 'center',
        alignItems: 'center'
    },

    disabled: {
        color: Colors.DISABLED
    },

    selected: {
        backgroundColor: Colors.SELECTED
    }
});
export default IconLink
