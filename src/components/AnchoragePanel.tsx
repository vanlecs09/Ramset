// import React from 'react';
// import type { EndAnchorageParams } from '../App';
// import { DEFAULT_END_ANCHORAGE_PARAMS } from '../constants/defaultParams';
// import '../styles/AnchoragePanel.css';

// interface AnchoragePanelProps {
//   params: EndAnchorageParams;
//   onParamsChange: (params: EndAnchorageParams) => void;
//   isVisible: boolean;
//   onToggleVisibility: () => void;
// }

// export const AnchoragePanel: React.FC<AnchoragePanelProps> = ({
//   params,
//   onParamsChange,
//   isVisible,
//   onToggleVisibility,
// }) => {
//   const handleInputChange = (key: keyof EndAnchorageParams, value: number | boolean) => {
//     onParamsChange({
//       ...params,
//       [key]: value,
//     });
//   };

//   const handleReset = () => {
//     onParamsChange(DEFAULT_END_ANCHORAGE_PARAMS);
//   };

//   return (
//     <div className="anchorage-panel">
//       <div className="panel-header">
//         <h3>Anchorage Configuration</h3>
//         <button className="toggle-btn" onClick={onToggleVisibility}>
//           {isVisible ? '▼' : '▶'}
//         </button>
//       </div>

//       {isVisible && (
//         <div className="panel-content">
//           {/* Beam Properties */}
//           <div className="section">
//             <h4>Beam Properties</h4>
//             <div className="param-group">
//               <label>Beam Width (m)</label>
//               <input
//                 type="range"
//                 min="0.1"
//                 max="1"
//                 step="0.05"
//                 value={params.beamWidth}
//                 onChange={(e) => handleInputChange('beamWidth', parseFloat(e.target.value))}
//               />
//               <span className="value">{params.beamWidth.toFixed(2)}</span>
//             </div>

//             <div className="param-group">
//               <label>Beam Height (m)</label>
//               <input
//                 type="range"
//                 min="0.1"
//                 max="1"
//                 step="0.05"
//                 value={params.beamHeight}
//                 onChange={(e) => handleInputChange('beamHeight', parseFloat(e.target.value))}
//               />
//               <span className="value">{params.beamHeight.toFixed(2)}</span>
//             </div>

//             <div className="param-group">
//               <label>Beam Depth (m)</label>
//               <input
//                 type="range"
//                 min="0.1"
//                 max="1"
//                 step="0.05"
//                 value={params.beamDepth}
//                 onChange={(e) => handleInputChange('beamDepth', parseFloat(e.target.value))}
//               />
//               <span className="value">{params.beamDepth.toFixed(2)}</span>
//             </div>
//           </div>

//           {/* Anchor Pin Properties */}
//           <div className="section">
//             <h4>Anchor Pin Configuration</h4>

//             <div className="param-group">
//               <label>Pin Diameter (m)</label>
//               <input
//                 type="range"
//                 min="0.01"
//                 max="0.1"
//                 step="0.005"
//                 value={params.pinDiameter}
//                 onChange={(e) => handleInputChange('pinDiameter', parseFloat(e.target.value))}
//               />
//               <span className="value">{params.pinDiameter.toFixed(3)}</span>
//             </div>

//             <div className="param-group">
//               <label>Pin Height (m)</label>
//               <input
//                 type="range"
//                 min="0.2"
//                 max="2"
//                 step="0.1"
//                 value={params.pinHeight}
//                 onChange={(e) => handleInputChange('pinHeight', parseFloat(e.target.value))}
//               />
//               <span className="value">{params.pinHeight.toFixed(2)}</span>
//             </div>

//             <div className="param-group">
//               <label>Pin Rows (Count)</label>
//               <input
//                 type="range"
//                 min="1"
//                 max="5"
//                 step="1"
//                 value={params.pinRows}
//                 onChange={(e) => handleInputChange('pinRows', parseInt(e.target.value))}
//               />
//               <span className="value">{params.pinRows}</span>
//             </div>

//             <div className="param-group">
//               <label>Pin Columns (Count)</label>
//               <input
//                 type="range"
//                 min="1"
//                 max="5"
//                 step="1"
//                 value={params.pinColumns}
//                 onChange={(e) => handleInputChange('pinColumns', parseInt(e.target.value))}
//               />
//               <span className="value">{params.pinColumns}</span>
//             </div>

//             <div className="param-group">
//               <label>Pin X Spacing (m)</label>
//               <input
//                 type="range"
//                 min="0.05"
//                 max="0.5"
//                 step="0.02"
//                 value={params.pinSpacingX}
//                 onChange={(e) => handleInputChange('pinSpacingX', parseFloat(e.target.value))}
//               />
//               <span className="value">{params.pinSpacingX.toFixed(2)}</span>
//             </div>

//             <div className="param-group">
//               <label>Pin Y Spacing (m)</label>
//               <input
//                 type="range"
//                 min="0.05"
//                 max="0.5"
//                 step="0.02"
//                 value={params.pinSpacingY}
//                 onChange={(e) => handleInputChange('pinSpacingY', parseFloat(e.target.value))}
//               />
//               <span className="value">{params.pinSpacingY.toFixed(2)}</span>
//             </div>
//           </div>

//           {/* Reinforcement Plate */}
//           <div className="section">
//             <h4>Reinforcement Plate</h4>

//             <div className="param-group">
//               <label>Plate Thickness (m)</label>
//               <input
//                 type="range"
//                 min="0.01"
//                 max="0.1"
//                 step="0.005"
//                 value={params.reinforcementThickness}
//                 onChange={(e) => handleInputChange('reinforcementThickness', parseFloat(e.target.value))}
//               />
//               <span className="value">{params.reinforcementThickness.toFixed(3)}</span>
//             </div>

//             <div className="param-group">
//               <label>Show Reinforcement</label>
//               <input
//                 type="checkbox"
//                 checked={params.showReinforcement}
//                 onChange={(e) => handleInputChange('showReinforcement', e.target.checked)}
//               />
//             </div>
//           </div>

//           {/* Positioning */}
//           <div className="section">
//             <h4>Positioning</h4>

//             <div className="param-group">
//               <label>Concrete Width (m)</label>
//               <input
//                 type="range"
//                 min="0.1"
//                 max="2"
//                 step="0.05"
//                 value={params.concreteWidth}
//                 onChange={(e) => handleInputChange('concreteWidth', parseFloat(e.target.value))}
//               />
//               <span className="value">{params.concreteWidth.toFixed(2)}</span>
//             </div>

//             <div className="param-group">
//               <label>Concrete Height (m)</label>
//               <input
//                 type="range"
//                 min="0.1"
//                 max="2"
//                 step="0.05"
//                 value={params.concreteHeight}
//                 onChange={(e) => handleInputChange('concreteHeight', parseFloat(e.target.value))}
//               />
//               <span className="value">{params.concreteHeight.toFixed(2)}</span>
//             </div>

//             <div className="param-group">
//               <label>Beam Offset X (m)</label>
//               <input
//                 type="range"
//                 min="0"
//                 max="0.5"
//                 step="0.02"
//                 value={params.beamOffsetX}
//                 onChange={(e) => handleInputChange('beamOffsetX', parseFloat(e.target.value))}
//               />
//               <span className="value">{params.beamOffsetX.toFixed(2)}</span>
//             </div>
//           </div>

//           {/* Controls */}
//           <div className="panel-controls">
//             <button className="reset-btn" onClick={handleReset}>
//               Reset to Defaults
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
