Use scripts\chain.cmd to run chained commands through cmd.exe so Windows shells that don't support `&&` (older PowerShell) will still execute chained operations.

Examples:

Run TypeScript check then a PHP lint with chaining:

    scripts\chain.cmd "npx tsc --noEmit && php -l \"app\\Models\\User.php\""

Or run two commands:

    scripts\chain.cmd "echo first && echo second"

