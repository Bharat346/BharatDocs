export default function ErrorAlert({ errors, theme }) {
    return (
        <div className={`${cardClasses}`}>
            <h4 className="font-medium mb-2">Errors</h4>
            <div className="space-y-1 text-sm">
                {errors.map((error, index) => (
                    <div key={index} className="flex justify-between">
                        <span className="opacity-75">{error}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}