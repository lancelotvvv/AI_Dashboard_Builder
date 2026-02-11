import React from 'react'
import * as Recharts from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { WidgetProps } from '@/registry/widget-registry'

/**
 * Compiles a custom code string into a React component.
 * The code is a function body that receives { config, data, width, height }
 * and has React, Recharts components, and lucide icons in scope.
 * Returns null if compilation fails.
 */
export function compileCustomWidget(code: string): React.FC<WidgetProps> | null {
  try {
    // Build the function with all dependencies in scope
    const fn = new Function(
      'React',
      'useState',
      'useMemo',
      'useEffect',
      'useRef',
      // Recharts
      'ResponsiveContainer',
      'BarChart', 'Bar',
      'LineChart', 'Line',
      'PieChart', 'Pie', 'Cell',
      'AreaChart', 'Area',
      'ScatterChart', 'Scatter',
      'XAxis', 'YAxis',
      'CartesianGrid', 'Tooltip', 'Legend',
      // Lucide
      'TrendingUp', 'TrendingDown',
      // Props
      'config', 'data', 'width', 'height',
      // Code body
      code,
    )

    const CustomWidget: React.FC<WidgetProps> = ({ config, data, width, height }) => {
      try {
        return fn(
          React,
          React.useState,
          React.useMemo,
          React.useEffect,
          React.useRef,
          Recharts.ResponsiveContainer,
          Recharts.BarChart, Recharts.Bar,
          Recharts.LineChart, Recharts.Line,
          Recharts.PieChart, Recharts.Pie, Recharts.Cell,
          Recharts.AreaChart, Recharts.Area,
          Recharts.ScatterChart, Recharts.Scatter,
          Recharts.XAxis, Recharts.YAxis,
          Recharts.CartesianGrid, Recharts.Tooltip, Recharts.Legend,
          TrendingUp, TrendingDown,
          config, data, width, height,
        )
      } catch (e) {
        return React.createElement('div', { className: 'p-3 text-xs text-red-500' }, `Runtime error: ${(e as Error).message}`)
      }
    }
    CustomWidget.displayName = 'CustomWidget'

    // Test compilation by checking the function was created
    return CustomWidget
  } catch (e) {
    console.error('Custom code compilation error:', e)
    return null
  }
}

/**
 * Validates custom code by attempting to compile it.
 * Returns an error message or null if valid.
 */
export function validateCustomCode(code: string): string | null {
  try {
    new Function(
      'React', 'useState', 'useMemo', 'useEffect', 'useRef',
      'ResponsiveContainer',
      'BarChart', 'Bar', 'LineChart', 'Line',
      'PieChart', 'Pie', 'Cell', 'AreaChart', 'Area',
      'ScatterChart', 'Scatter', 'XAxis', 'YAxis',
      'CartesianGrid', 'Tooltip', 'Legend',
      'TrendingUp', 'TrendingDown',
      'config', 'data', 'width', 'height',
      code,
    )
    return null
  } catch (e) {
    return (e as Error).message
  }
}
