// components/BarChart.tsx
'use client'
import React from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import getDashboardSurfaceClasses from '@/utils/getDashboardSurfaceClasses'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface Props { labels: string[]; values: number[] }

const BarChart: React.FC<Props> = ({ labels, values }) => {
  const data = {
    labels,
    datasets: [{
      label: 'Acolhidos',
      data: values,
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.4)',
      borderWidth: 1,
      barPercentage: 0.7,
      categoryPercentage: 0.7,
    }],
  }

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Acolhidos por mês' },
      tooltip: { intersect: false, mode: 'index' },
    },
    scales: {
      x: {
        ticks: { maxRotation: 0, autoSkip: true },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { drawBorder: false },
        ticks: { precision: 0 }, // inteiros
      },
    },
  }

  const surface = getDashboardSurfaceClasses()

  return (
    <div className={`w-full relative h-[38vh] sm:h-[50vh] lg:h-[60vh] m-auto p-3 sm:p-4 ${surface}`}>
      <Bar data={data} options={options} />
    </div>
  )
}
export default BarChart