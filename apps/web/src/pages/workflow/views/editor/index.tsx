import { memo, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRequest } from 'ahooks';
import {
    ReactFlow,
    Background,
    SelectionMode,
    useNodesState,
    useEdgesState,
    ReactFlowProvider,
    type NodeChange,
} from '@xyflow/react';
import { useTheme } from '@milesight/shared/src/hooks';
import { workflowAPI, awaitWrap, getResponseData, isRequestSuccess } from '@/services/http';
import { MIN_ZOOM, MAX_ZOOM } from './constant';
import { useNodeTypes, useInteractions, useWorkflow } from './hooks';
import {
    Topbar,
    Controls,
    ConfigPanel,
    Edge,
    HelperLines,
    getHelperLines,
    EntryPanel,
} from './components';
import demoData from './demo-data.json';

import '@xyflow/react/dist/style.css';
import './style.less';

const edgeTypes: Record<WorkflowEdgeType, React.FC<any>> = {
    addable: Edge,
};

/**
 * Workflow Editor
 */
const WorkflowEditor = () => {
    const { grey } = useTheme();
    const nodeTypes = useNodeTypes();
    const { isValidConnection } = useWorkflow();
    const { handleConnect, handleBeforeDelete, handleEdgeMouseEnter, handleEdgeMouseLeave } =
        useInteractions();
    const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowEdge>([]);

    // ---------- Fetch Data ----------
    const [searchParams] = useSearchParams();
    const wid = searchParams.get('wid');
    const { loading } = useRequest(
        async () => {
            if (!wid) return;
            // TODO: Call workflow detail API
            // const [error, resp] = await awaitWrap(workflowAPI.getFlowDesign({ id: wid }));

            // if (error || !isRequestSuccess(resp)) return;
            // const data = getResponseData(resp);
            // console.log(data);

            await new Promise(resolve => {
                setTimeout(resolve, 500);
            });
            setNodes(demoData.nodes as WorkflowNode[]);
            setEdges(demoData.edges as WorkflowEdge[]);
        },
        {
            debounceWait: 300,
            refreshDeps: [wid],
        },
    );

    // ---------- Show Helper Lines when node change ----------
    const [helperLineHorizontal, setHelperLineHorizontal] = useState<number | undefined>(undefined);
    const [helperLineVertical, setHelperLineVertical] = useState<number | undefined>(undefined);
    const handleNodesChange = useCallback(
        (changes: NodeChange<WorkflowNode>[]) => {
            // reset the helper lines (clear existing lines, if any)
            setHelperLineHorizontal(undefined);
            setHelperLineVertical(undefined);

            if (
                changes.length === 1 &&
                changes[0].type === 'position' &&
                changes[0].dragging &&
                changes[0].position
            ) {
                const helperLines = getHelperLines(changes[0], nodes || []);

                // if we have a helper line, we snap the node to the helper line position
                // this is being done by manipulating the node position inside the change object
                changes[0].position.x = helperLines.snapPosition.x ?? changes[0].position.x;
                changes[0].position.y = helperLines.snapPosition.y ?? changes[0].position.y;

                // if helper lines are returned, we set them so that they can be displayed
                setHelperLineHorizontal(helperLines.horizontal);
                setHelperLineVertical(helperLines.vertical);
            }

            onNodesChange(changes);
        },
        [nodes, onNodesChange],
    );

    return (
        <div className="ms-main">
            <Topbar />
            <div className="ms-view ms-view-wf_editor">
                <div className="ms-view__inner">
                    <ReactFlow<WorkflowNode, WorkflowEdge>
                        fitView
                        className="ms-workflow"
                        minZoom={MIN_ZOOM}
                        maxZoom={MAX_ZOOM}
                        selectionOnDrag={false}
                        selectNodesOnDrag={false}
                        selectionKeyCode={null}
                        multiSelectionKeyCode={null}
                        selectionMode={SelectionMode.Partial}
                        isValidConnection={isValidConnection}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        nodes={nodes}
                        edges={edges}
                        onBeforeDelete={handleBeforeDelete}
                        onNodesChange={handleNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={handleConnect}
                        onEdgeMouseEnter={handleEdgeMouseEnter}
                        onEdgeMouseLeave={handleEdgeMouseLeave}
                    >
                        <Background style={{ backgroundColor: grey['100'] }} />
                        <Controls minZoom={MIN_ZOOM} maxZoom={MAX_ZOOM} />
                        <HelperLines
                            horizontal={helperLineHorizontal}
                            vertical={helperLineVertical}
                        />
                        <ConfigPanel />
                        <EntryPanel loading={!!wid || loading} />
                    </ReactFlow>
                </div>
            </div>
        </div>
    );
};

export default memo(() => (
    <ReactFlowProvider>
        <WorkflowEditor />
    </ReactFlowProvider>
));