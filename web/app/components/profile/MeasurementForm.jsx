'use client'

import { useState } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'

const MEASUREMENT_FIELDS = {
    body: [
        { key: 'height', label: 'Height', placeholder: '170', unit: 'cm' },
        { key: 'weight', label: 'Weight', placeholder: '65', unit: 'kg' },
        { key: 'chest', label: 'Chest/Bust', placeholder: '90', unit: 'cm' },
        { key: 'waist', label: 'Waist', placeholder: '70', unit: 'cm' },
        { key: 'hips', label: 'Hips', placeholder: '95', unit: 'cm' },
        { key: 'shoulders', label: 'Shoulder Width', placeholder: '40', unit: 'cm' },
    ],
    arms: [
        { key: 'armLength', label: 'Arm Length', placeholder: '60', unit: 'cm' },
        { key: 'bicep', label: 'Bicep', placeholder: '30', unit: 'cm' },
        { key: 'wrist', label: 'Wrist', placeholder: '16', unit: 'cm' },
    ],
    legs: [
        { key: 'inseam', label: 'Inseam', placeholder: '80', unit: 'cm' },
        { key: 'thigh', label: 'Thigh', placeholder: '55', unit: 'cm' },
        { key: 'calf', label: 'Calf', placeholder: '36', unit: 'cm' },
        { key: 'ankle', label: 'Ankle', placeholder: '22', unit: 'cm' },
    ],
    neck: [
        { key: 'neck', label: 'Neck Circumference', placeholder: '38', unit: 'cm' },
        { key: 'backLength', label: 'Back Length', placeholder: '42', unit: 'cm' },
    ]
}

export default function MeasurementForm({ initialData = {}, onSave }) {
    const [measurements, setMeasurements] = useState(initialData)
    const [unit, setUnit] = useState('cm')
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState(null)

    const handleChange = (key, value) => {
        setMeasurements(prev => ({ ...prev, [key]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMessage(null)
        setIsSaving(true)

        try {
            if (onSave) {
                await onSave(measurements)
            }
            setMessage({ type: 'success', text: 'Measurements saved successfully!' })
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to save measurements' })
        } finally {
            setIsSaving(false)
        }
    }

    const renderSection = (title, fields) => (
        <div key={title} className="space-y-3">
            <h3 className="text-lg font-serif">{title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map(field => (
                    <div key={field.key} className="space-y-1">
                        <label className="text-xs uppercase tracking-[0.2em] text-muted">
                            {field.label}
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                step="0.1"
                                placeholder={field.placeholder}
                                value={measurements[field.key] || ''}
                                onChange={(e) => handleChange(field.key, e.target.value)}
                                className="form-input flex-1"
                            />
                            <span className="px-3 py-2 bg-card border border-card-border rounded-lg text-sm text-muted">
                                {unit}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-serif">Body Measurements</h2>
                        <p className="text-sm text-muted mt-1">
                            Accurate measurements ensure the perfect fit
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setUnit('cm')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${unit === 'cm'
                                    ? 'bg-primary text-white'
                                    : 'bg-card border border-card-border hover:bg-card-hover'
                                }`}
                        >
                            CM
                        </button>
                        <button
                            type="button"
                            onClick={() => setUnit('in')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${unit === 'in'
                                    ? 'bg-primary text-white'
                                    : 'bg-card border border-card-border hover:bg-card-hover'
                                }`}
                        >
                            IN
                        </button>
                    </div>
                </div>

                {renderSection('Body', MEASUREMENT_FIELDS.body)}
                {renderSection('Arms', MEASUREMENT_FIELDS.arms)}
                {renderSection('Legs', MEASUREMENT_FIELDS.legs)}
                {renderSection('Neck & Back', MEASUREMENT_FIELDS.neck)}

                <div className="space-y-3 pt-4 border-t border-card-border">
                    <label className="text-xs uppercase tracking-[0.2em] text-muted">
                        Additional Notes
                    </label>
                    <textarea
                        placeholder="Any special fitting requirements or notes..."
                        value={measurements.notes || ''}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        className="form-input"
                        rows={3}
                    />
                </div>

                {message && (
                    <p className={`text-sm ${message.type === 'error' ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {message.text}
                    </p>
                )}

                <div className="flex gap-3">
                    <Button type="submit" disabled={isSaving} className="flex-1">
                        {isSaving ? 'Saving...' : 'Save Measurements'}
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setMeasurements({})}>
                        Clear All
                    </Button>
                </div>
            </Card>

            <Card className="p-6 bg-card-secondary">
                <h3 className="text-sm font-semibold mb-2">📏 How to Measure</h3>
                <ul className="text-sm text-muted space-y-1">
                    <li>• Use a soft measuring tape</li>
                    <li>• Measure over light clothing</li>
                    <li>• Stand naturally, don't pull tape tight</li>
                    <li>• Have someone help for accuracy</li>
                    <li>• Measure twice to confirm</li>
                </ul>
            </Card>
        </form>
    )
}
