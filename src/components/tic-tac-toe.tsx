import * as React from 'react';

import bind from 'bind-decorator';
import { AvTransform, AvModel, AvGrabButton } from '@aardvarkxr/aardvark-react';
import { AvNodeTransform } from '@aardvarkxr/aardvark-shared';

import CroquetAdapter from "../scripts/croquet_adapter";
import { ConditionalGrabbable } from './conditional_grabbable';
import { TicTacToeViewState } from '../types';
import { modelSettings, gameSessionId, gameNameSpace, GameEvents, sceneScale, TicTacToeEvents } from '../settings';
import { pawnGenerator } from '../scripts/tic_tac_toe_utils';
import { PawnPiece } from './pawn';
import { INITIAL_VIEW_STATE } from '../constants';

export class TicTacToe extends React.Component<{}, TicTacToeViewState>
{
	constructor( props: any )
	{
		super( props );
		this.state = INITIAL_VIEW_STATE;
	}

	componentDidMount() {
		const croquetSetupCallback = CroquetAdapter.init({
			onCroquetUpdate: (_namespace: string, _name: string, data: any) => {
				console.log("[REACT] got new state of", data);
				const updatedState = {
					...this.state,
					...data,
				};
				this.setState(updatedState);
			},
			sessionId: gameSessionId,
		});

		croquetSetupCallback.then((value: { view: { viewId: string }}) => {
			this.setState({
				...this.state,
				localUser: value.view.viewId,
			});
		});
	}

	@bind public onDestroy() {
		const updatedState = {
			...this.state,
			shouldShowBoard: false,
		};
		this.setState(updatedState);
	}

	@bind public onReset() {
		CroquetAdapter.emit(gameNameSpace, GameEvents.state_update, { type: TicTacToeEvents.reset, data: {} });
		const updatedState: TicTacToeViewState = {
			...this.state,
			board: {
				...this.state.board,
				properties: {
					...this.state.board.properties,
				}
			}
		};
		this.setState(updatedState);
	}

	@bind public onSpawnPawn(type: 'x' | 'o') {
		const pawn = pawnGenerator({
			type,
			nodeState: {
				pose: {
					position: {x: 0, y: 5, z: 0},
					rotation: {x: 0, y: 0, z:0, w:1},
					scale: {x: 1, y: 1, z: 1}
				},
				properties: {
					control: {
						owner: null,
						expiration: 0,
					}
				},
			},
		});
		CroquetAdapter.emit(gameNameSpace, GameEvents.state_update, { type: TicTacToeEvents.spawn_pawn, data: pawn });
	}

	// example of a world relative transform
	@bind public onAardvarkTranformUpdated(_parentFromNode: AvNodeTransform, universeFromNode: AvNodeTransform) {
		CroquetAdapter.emit(gameNameSpace, GameEvents.state_update, {
			type: TicTacToeEvents.board_moved,
			data: { newPose: universeFromNode},
		});
	}

	// example of a parent relative transform
	@bind public onTranformUpdatedPawn(parentFromNode: AvNodeTransform, _universeFromNode: AvNodeTransform, guid: string) {
		CroquetAdapter.emit(gameNameSpace, GameEvents.state_update, {
			type: TicTacToeEvents.pawn_moved,
			data: { guid, newPose: parentFromNode },
		});
	}

	public render()
	{
		const { board, shouldShowBoard, pawns, localUser } = this.state;

		// TODO: Ensure that destroyed board gets GC'd
		//if (!shouldShowBoard) {
		//	return null;
		//}

		const buttonPadding = 1.25;
		const boardColor = {r: .9, g: .6, b: .3}
		const boardTransform = {
			translateX: modelSettings.board.dimensions.x / 2.0,
			translateY: 0,
			translateZ: (modelSettings.board.dimensions.z / 2.0) + 2.0,
		}

		console.log("RENDERING STUFF");

		return (
			<ConditionalGrabbable
				pose={board.pose}
				shouldDestroy={!shouldShowBoard}
				control={board.properties.control}
				localUser={localUser}
				radius={0.1}
				onTransformUpdated={this.onAardvarkTranformUpdated}
			>
				<AvTransform uniformScale={ sceneScale }>
					{/* Game board itself */}
					<AvModel uri={ modelSettings.board.path } color={boardColor} />
					<AvTransform {...boardTransform}>
						{/* Board destroy button */}
						<AvGrabButton modelUri={modelSettings.destroyButton.path} onTrigger={ this.onDestroy } radius={ modelSettings.resetButton.dimensions.x }/>
						{/* Game reset button */}
						<AvTransform 
							translateX={ -modelSettings.board.dimensions.x * buttonPadding }>
							<AvGrabButton modelUri={modelSettings.resetButton.path} onTrigger={ this.onReset } radius={  modelSettings.resetButton.dimensions.x }/>
						</AvTransform>
						{/* Pawn spawner buttons (TODO: Make them not look exactly like pawns) */}
						<AvTransform
							translateZ={ -2 * modelSettings.board.dimensions.z }
							translateX={ -modelSettings.board.dimensions.x }>
							<AvGrabButton modelUri={modelSettings.x.path} onTrigger={ () => this.onSpawnPawn('x') } radius={ modelSettings.x.dimensions.x }/>
							<AvTransform translateX={modelSettings.x.dimensions.x * buttonPadding}>
								<AvGrabButton modelUri={modelSettings.o.path} onTrigger={ () => this.onSpawnPawn('o') } radius={ modelSettings.o.dimensions.x }/>
							</AvTransform>
						</AvTransform>
						{/* Spawned pawns */}
						{pawns.map((pawn) => {
							return (
								<PawnPiece key={pawn.guid} pawn={pawn} onTransformUpdated={this.onTranformUpdatedPawn} localUser={this.state.localUser} />
							);
						})}
					</AvTransform>
				</AvTransform>
			</ConditionalGrabbable>
		)
	}
}
