import * as React from 'react';
import  * as ReactDOM from 'react-dom';

import bind from 'bind-decorator';

import { AvGadget, AvTransform, AvPanel, AvGrabbable, AvModel, HighlightType, GrabResponse, AvSphereHandle } from '@aardvarkxr/aardvark-react';
import { EndpointAddr, AvGrabEvent, endpointAddrToString } from '@aardvarkxr/aardvark-shared';


interface SimpleClockState
{
	count: number;
	grabbableHighlight: HighlightType;
}

class SimpleClock extends React.Component< {}, SimpleClockState >
{
	private m_secondInterval: number = 0;

	constructor( props: any )
	{
		super( props );
		this.state = 
		{ 
			count: 0,
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
		this.m_secondInterval = window.setInterval( () => { this.forceUpdate(); }, 100 );
	}

	public componentWillUnmount()
	{
		window.clearInterval( this.m_secondInterval );
	}


	public render()
	{
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
							translateZ={ -2 } translateY={ Math.sin(now.getMilliseconds()) / 10 } rotateY={ 180 } >
					<AvModel uri={ "/models/slime.glb" } />
				</AvTransform>
			</AvGrabbable>	);
	}
}

ReactDOM.render( <SimpleClock/>, document.getElementById( "root" ) );
