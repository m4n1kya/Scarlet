import plotly.graph_objects as go
from typing import List, Dict, Any

class ScarletAnalyzer:
    _DARK_TEMPLATE = 'plotly_dark'
    _SCARLET = '#DC143C'

    @staticmethod
    def _empty_figure(message: str = 'No data') -> go.Figure:
        fig = go.Figure()
        fig.add_annotation(
            text=message, xref="paper", yref="paper", x=0.5, y=0.5,
            showarrow=False, font=dict(size=20, color="gray")
        )
        fig.update_layout(template=ScarletAnalyzer._DARK_TEMPLATE)
        return fig

    @staticmethod
    def detection_summary_chart(history: List[Dict[str, Any]]) -> go.Figure:
        if not history:
            return ScarletAnalyzer._empty_figure()
            
        fire = sum(r.get('fire_count', 0) for r in history)
        smoke = sum(r.get('smoke_count', 0) for r in history)
        default = sum(r.get('default_count', 0) for r in history)
        
        fig = go.Figure(data=[
            go.Bar(x=['Fire', 'Smoke', 'Default'], y=[fire, smoke, default], 
                   marker_color=[ScarletAnalyzer._SCARLET, '#6b7280', '#f59e0b'])
        ])
        fig.update_layout(title="Total Detections by Type", template=ScarletAnalyzer._DARK_TEMPLATE)
        return fig

    @staticmethod
    def confidence_distribution_chart(history: List[Dict[str, Any]]) -> go.Figure:
        if not history:
            return ScarletAnalyzer._empty_figure()
            
        confs = [r.get('avg_confidence', 0) for r in history if r.get('avg_confidence', 0) > 0]
        if not confs:
            return ScarletAnalyzer._empty_figure('No confidence data')
            
        fig = go.Figure(data=[go.Histogram(x=confs, marker_color=ScarletAnalyzer._SCARLET)])
        fig.update_layout(title="Average Confidence Distribution", template=ScarletAnalyzer._DARK_TEMPLATE)
        return fig

    @staticmethod
    def detection_type_pie(history: List[Dict[str, Any]]) -> go.Figure:
        if not history:
            return ScarletAnalyzer._empty_figure()
            
        fire = sum(r.get('fire_count', 0) for r in history)
        smoke = sum(r.get('smoke_count', 0) for r in history)
        default = sum(r.get('default_count', 0) for r in history)
        
        if fire + smoke + default == 0:
            return ScarletAnalyzer._empty_figure('No detections found')
            
        fig = go.Figure(data=[
            go.Pie(labels=['Fire', 'Smoke', 'Default'], values=[fire, smoke, default], 
                   marker=dict(colors=['#ef4444', '#6b7280', '#f59e0b']))
        ])
        fig.update_layout(title="Detection Proportions", template=ScarletAnalyzer._DARK_TEMPLATE)
        return fig

    @staticmethod
    def risk_distribution_chart(history: List[Dict[str, Any]]) -> go.Figure:
        if not history:
            return ScarletAnalyzer._empty_figure()
            
        counts = {'LOW': 0, 'MODERATE': 0, 'HIGH': 0, 'CRITICAL': 0}
        for r in history:
            risk = r.get('risk_level', 'LOW')
            if risk in counts:
                counts[risk] += 1
                
        colors = ['#22c55e', '#f59e0b', '#f97316', '#ef4444']
        
        fig = go.Figure(data=[
            go.Bar(x=list(counts.keys()), y=list(counts.values()), marker_color=colors)
        ])
        fig.update_layout(title="Risk Level Distribution", template=ScarletAnalyzer._DARK_TEMPLATE)
        return fig

    @staticmethod
    def timeline_chart(history: List[Dict[str, Any]]) -> go.Figure:
        if not history:
            return ScarletAnalyzer._empty_figure()
            
        sorted_history = sorted(history, key=lambda x: x.get('timestamp', ''))
        timestamps = [r.get('timestamp') for r in sorted_history]
        detections = [r.get('total_detections', 0) for r in sorted_history]
        
        fig = go.Figure(data=[
            go.Scatter(x=timestamps, y=detections, mode='lines+markers', line=dict(color=ScarletAnalyzer._SCARLET))
        ])
        fig.update_layout(title="Detections Over Time", template=ScarletAnalyzer._DARK_TEMPLATE)
        return fig

    @staticmethod
    def video_frame_chart(frame_results: List[Any]) -> go.Figure:
        if not frame_results:
            return ScarletAnalyzer._empty_figure()
            
        frames = list(range(1, len(frame_results) + 1))
        fires = [r.fire_count for r in frame_results]
        smokes = [r.smoke_count for r in frame_results]
        
        fig = go.Figure()
        fig.add_trace(go.Scatter(x=frames, y=fires, name='Fire', line=dict(color='#ef4444')))
        fig.add_trace(go.Scatter(x=frames, y=smokes, name='Smoke', line=dict(color='#6b7280')))
        fig.update_layout(title="Detections per Frame", template=ScarletAnalyzer._DARK_TEMPLATE)
        return fig
