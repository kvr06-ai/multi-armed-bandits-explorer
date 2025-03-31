from fastapi import APIRouter, HTTPException
from app.models.simulation import SimulationRequest, SimulationResponse
from app.core.simulation_runner import SimulationRunner
from app.core.bandit_problem import BanditProblem
from app.core.algorithms import create_algorithm
from app.core.distributions import create_distribution

router = APIRouter()

@router.post("", response_model=SimulationResponse)
async def run_simulation(request: SimulationRequest):
    """Run one or more bandit simulation setups."""
    try:
        # Create bandit problem
        arms = []
        for arm_config in request.bandit_problem.arms:
            distribution = create_distribution(
                arm_config.distribution.id,
                arm_config.distribution.params
            )
            arms.append(distribution)
        
        bandit_problem = BanditProblem(arms)
        
        # Run each simulation setup
        runner = SimulationRunner()
        results = []
        
        for setup in request.setups:
            algorithm = create_algorithm(
                setup.algorithm.id,
                bandit_problem.get_num_arms(),
                setup.algorithm.params
            )
            
            result = runner.run(
                bandit_problem,
                algorithm,
                request.num_steps,
                request.num_runs if request.num_runs else 1
            )
            
            results.append({
                "setup_id": setup.setup_id,
                "metrics": result,
                "summary": {
                    "total_reward": result["avg_cumulative_reward"][-1] if result["avg_cumulative_reward"] else 0,
                    "final_regret": result["avg_cumulative_regret"][-1] if result["avg_cumulative_regret"] else 0
                }
            })
            
        return {"results": results}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 