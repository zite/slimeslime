import * as React from 'react';
import  * as ReactDOM from 'react-dom';

import bind from 'bind-decorator';

import { AvGadget, AvTransform, AvPanel, AvGrabbable, AvModel, HighlightType, GrabResponse, AvSphereHandle } from '@aardvarkxr/aardvark-react';
import { EndpointAddr, AvGrabEvent, endpointAddrToString } from '@aardvarkxr/aardvark-shared';


interface SimpleClockState
{
	grabbableHighlight: HighlightType;
}

class SimpleClock extends React.Component< {}, SimpleClockState >
{
	private m_secondInterval: number = 0;
	private bounceY: number = 0;
	private bounceRate: number = 0.02;
	private bounceYMin: number = 0.025;
	private bounceScale: number = 0.25;

	constructor( props: any )
	{
		super( props );
		this.state = 
		{ 
			grabbableHighlight: HighlightType.None,
		};
	}

	@bind 
	public onHighlightGrabbable( highlight: HighlightType )
	{
		this.setState( { grabbableHighlight: highlight } );
	}

	@bind public onGrabRequest( grabRequest: AvGrabEvent ): Promise< GrabResponse >
	{
		// this is totally unnecessary, but a good test of the plumbing.
		let response: GrabResponse =
		{
			allowed: true,
		};
		return Promise.resolve( response );
	}

	public componentWillMount()
	{
		this.m_secondInterval = window.setInterval( () => { this.forceUpdate(); }, 12 );
	}

	public componentWillUnmount()
	{
		window.clearInterval( this.m_secondInterval );
	}

	public render()
	{
		this.bounceY += this.bounceRate / this.m_secondInterval;
		let bounce = (Math.sin(this.bounceY) * this.bounceScale);
		bounce = Math.max(bounce, 0);

		let sDivClasses:string;
		let scale = 0.05;
		switch( this.state.grabbableHighlight )
		{
			default:
			case HighlightType.None:
				sDivClasses = "FullPage NoGrabHighlight";
				break;

			case HighlightType.InRange:
				sDivClasses = "FullPage InRangeHighlight";
				break;

			case HighlightType.Grabbed:
				sDivClasses = "FullPage GrabbedHighlight";
				break;

			case HighlightType.InHookRange:
				sDivClasses = "FullPage GrabbedHighlight";
				break;
		
		}

		let now = new Date();
		return (
			<AvGrabbable preserveDropTransform={ true } updateHighlight={ this.onHighlightGrabbable } > 
				<AvTransform uniformScale={ this.state.grabbableHighlight == HighlightType.InRange ? 0.011 : 0.009 }
							translateZ={ -2 } translateY={ bounce } rotateY={ 180 } >
					<AvModel uri={ "/models/slime.glb" } />
				</AvTransform>
			</AvGrabbable>	);
	}
}

ReactDOM.render( <SimpleClock/>, document.getElementById( "root" ) );
