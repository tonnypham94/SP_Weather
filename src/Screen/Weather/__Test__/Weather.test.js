import React from 'react'
import ReactDOM from 'react-dom'
import renderer from 'react-test-renderer'
import { renderHook } from '@testing-library/react-hooks'
import Enzyme, { shallow, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { act } from 'react-dom/test-utils'
import 'jest-canvas-mock'

import Weather from '../index'
import exportFunctions from '../action'

Enzyme.configure({ adapter: new Adapter() })
const spyScrollTo = jest.fn()

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
        expect(wrapper.find('.cw-day').text()).not.toBe('14th April')
    })

    it('the day of class .cw-day should be changed', () => {
        const wrapper = mount(<Weather />)
        wrapper.update()
        let e = { target: { scrollLeft: 200 } }
        wrapper.find('.cw-Canvas').simulate('scroll', e)
        wrapper.update()
        expect(wrapper.find('.cw-day').text()).toEqual('13th April')
        let e1 = { target: { scrollLeft: 1800 } }
        wrapper.find('.cw-Canvas').simulate('scroll', e1)
        wrapper.update()
        let e2 = { target: { scrollLeft: 2600 } }
        wrapper.find('.cw-Canvas').simulate('scroll', e2)
        wrapper.update()
        let e3 = { target: { scrollLeft: 3600 } }
        wrapper.find('.cw-Canvas').simulate('scroll', e3)
    })

    test('window resize', () => {
        window.HTMLCanvasElement.prototype.getContext = () => { }
        const wrapper = mount(<Weather />)
        act(() => {
            global.innerWidth = 500
            global.dispatchEvent(new Event('resize'))
        })
        expect(wrapper.find('.cw-day').text()).toEqual('13th April')
        expect(wrapper.find('.cw-time').text()).toEqual('06:00 am')
    })

    test('window resize2', () => {
        window.HTMLCanvasElement.prototype.getContext = () => { }
        const wrapper = mount(<Weather />)
        act(() => {
            global.innerWidth = 3500
            global.dispatchEvent(new Event('resize'))
        })
        expect(wrapper.find('.cw-day').text()).toEqual('13th April')
        expect(wrapper.find('.cw-time').text()).toEqual('06:00 am')
    })

})

describe('<exportFunctions />', () => {
    test('getBezierXY', () => {
        const fooSpy = jest.spyOn(exportFunctions, 'getBezierXY')
        expect(fooSpy(0.5, 0, 0, 50, 100, 200, 100, 200, 100)).toEqual({ "x": 118.75, "y": 87.5 })
    })
})