use crate::game::player::PlayerInput;
use crate::nav_builder::nav_builder::NavBuilderProgram;

pub trait GadgetProgram: Send {
    /**
     * Called when the gadget is activated.
     */
    async fn on_activate(&mut self);

    /**
     * Called when the gadget is deactivated.
     */
    async fn on_deactivate(&mut self);

    /**
     * Called when the gadget input is received.
     */
    async fn on_input(&mut self, input: &PlayerInput);
}

pub struct GadgetTool {
    current_program: Option<NavBuilderProgram>,
}

impl GadgetTool {
    pub fn new(current_program: NavBuilderProgram) -> Self {
        Self {
            current_program: Some(current_program),
        }
    }

    pub async fn activate(&mut self) {
        if let Some(program) = &mut self.current_program {
            program.on_activate().await;
        }
    }

    pub async fn deactivate(&mut self) {
        if let Some(program) = &mut self.current_program {
            program.on_deactivate().await;
        }
    }

    pub async fn input(&mut self, input: PlayerInput) {
        if let Some(program) = &mut self.current_program {
            program.on_input(&input).await;
        }
    }
}
