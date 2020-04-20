import React from 'react'
import ReactDOM from 'react-dom'
import renderer from 'react-test-renderer'
import Enzyme, { shallow, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

import Weather from '../index'

Enzyme.configure({ adapter: new Adapter() })
const spyScrollTo = jest.fn();

describe('<Weather />', () => {
    it('render without crashing', () => {
        const div = document.createElement('div')
        ReactDOM.render(<Weather />, div)
        ReactDOM.unmountComponentAtNode(div)
    })

    it('after render, the time of class .cw-time should be 06:00 am', () => {
        window.HTMLCanvasElement.prototype.getContext = () => { }
        const wrapper = mount(<Weather />)
        expect(wrapper.find('.cw-time').text()).toEqual('06:00 am')
    })

    it('after render, the day of class .cw-day should be 13th April', () => {
        window.HTMLCanvasElement.prototype.getContext = () => { }
        const wrapper = mount(<Weather />)
        expect(wrapper.find('.cw-day').text()).toEqual('13th April')
    })

})